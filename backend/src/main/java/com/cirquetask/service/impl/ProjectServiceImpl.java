package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.MemberDto;
import com.cirquetask.model.dto.ProjectDto;
import com.cirquetask.model.dto.ProjectRequest;
import com.cirquetask.model.entity.*;
import com.cirquetask.model.enums.ProjectRole;
import com.cirquetask.model.mapper.ProjectMapper;
import com.cirquetask.repository.*;
import com.cirquetask.service.ActivityLogService;
import com.cirquetask.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final BoardColumnRepository columnRepository;
    private final ProjectMapper projectMapper;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public ProjectDto createProject(ProjectRequest request, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .prefix(request.getPrefix().toUpperCase())
                .color(request.getColor() != null ? request.getColor() : "#6366f1")
                .icon(request.getIcon() != null ? request.getIcon() : "folder")
                .owner(owner)
                .build();

        project = projectRepository.save(project);

        // Add owner as a member
        ProjectMember ownerMember = ProjectMember.builder()
                .project(project)
                .user(owner)
                .role(ProjectRole.OWNER)
                .build();
        memberRepository.save(ownerMember);

        // Create default board with columns
        Board defaultBoard = Board.builder()
                .name("Main Board")
                .project(project)
                .isDefault(true)
                .position(0)
                .build();
        defaultBoard = boardRepository.save(defaultBoard);

        String[][] defaultColumns = {
            {"Backlog", "#94a3b8"}, {"To Do", "#3b82f6"},
            {"In Progress", "#f59e0b"}, {"In Review", "#8b5cf6"}, {"Done", "#22c55e"}
        };
        for (int i = 0; i < defaultColumns.length; i++) {
            BoardColumn col = BoardColumn.builder()
                    .name(defaultColumns[i][0])
                    .color(defaultColumns[i][1])
                    .board(defaultBoard)
                    .position(i)
                    .isDoneColumn(i == defaultColumns.length - 1)
                    .build();
            columnRepository.save(col);
        }

        activityLogService.log("CREATE", "PROJECT", project.getId(),
                "Created project: " + project.getName(), null, null, userId, project.getId());

        log.info("Project created: {} by user {}", project.getName(), userId);

        ProjectDto dto = projectMapper.toDto(project);
        dto.setTaskCount(0);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDto getProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        validateMembership(projectId, userId);

        ProjectDto dto = projectMapper.toDto(project);
        dto.setTaskCount(projectRepository.countTasksByProjectId(projectId).intValue());
        List<ProjectMember> members = memberRepository.findByProjectId(projectId);
        dto.setMembers(projectMapper.toMemberDtoList(members));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getUserProjects(Long userId) {
        List<Project> projects = projectRepository.findByMemberUserId(userId);
        return projects.stream().map(p -> {
            ProjectDto dto = projectMapper.toDto(p);
            dto.setTaskCount(projectRepository.countTasksByProjectId(p.getId()).intValue());
            return dto;
        }).toList();
    }

    @Override
    @Transactional
    public ProjectDto updateProject(Long projectId, ProjectRequest request, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        validateAdminAccess(projectId, userId);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getColor() != null) project.setColor(request.getColor());
        if (request.getIcon() != null) project.setIcon(request.getIcon());

        project = projectRepository.save(project);

        activityLogService.log("UPDATE", "PROJECT", project.getId(),
                "Updated project: " + project.getName(), null, null, userId, project.getId());

        return projectMapper.toDto(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (!project.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("Only the project owner can delete the project");
        }

        projectRepository.delete(project);
        log.info("Project deleted: {} by user {}", project.getName(), userId);
    }

    @Override
    @Transactional
    public MemberDto addMember(Long projectId, Long memberUserId, ProjectRole role, Long currentUserId) {
        validateAdminAccess(projectId, currentUserId);

        if (memberRepository.existsByProjectIdAndUserId(projectId, memberUserId)) {
            throw new BadRequestException("User is already a member of this project");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        User user = userRepository.findById(memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberUserId));

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(role != null ? role : ProjectRole.MEMBER)
                .build();

        member = memberRepository.save(member);

        activityLogService.log("ADD_MEMBER", "PROJECT", projectId,
                "Added member: " + user.getFullName(), null, null, currentUserId, projectId);

        return projectMapper.toMemberDto(member);
    }

    @Override
    @Transactional
    public void removeMember(Long projectId, Long memberUserId, Long currentUserId) {
        validateAdminAccess(projectId, currentUserId);

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectMember", "userId", memberUserId));

        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Cannot remove the project owner");
        }

        memberRepository.delete(member);
    }

    @Override
    @Transactional
    public MemberDto updateMemberRole(Long projectId, Long memberUserId, ProjectRole role, Long currentUserId) {
        validateAdminAccess(projectId, currentUserId);

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectMember", "userId", memberUserId));

        if (member.getRole() == ProjectRole.OWNER) {
            throw new BadRequestException("Cannot change the owner's role");
        }

        member.setRole(role);
        member = memberRepository.save(member);
        return projectMapper.toMemberDto(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberDto> getMembers(Long projectId, Long userId) {
        validateMembership(projectId, userId);
        List<ProjectMember> members = memberRepository.findByProjectId(projectId);
        return projectMapper.toMemberDtoList(members);
    }

    private void validateMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new AccessDeniedException("You are not a member of this project");
        }
    }

    private void validateAdminAccess(Long projectId, Long userId) {
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this project"));

        if (member.getRole() != ProjectRole.OWNER && member.getRole() != ProjectRole.ADMIN) {
            throw new AccessDeniedException("You don't have admin access to this project");
        }
    }
}
