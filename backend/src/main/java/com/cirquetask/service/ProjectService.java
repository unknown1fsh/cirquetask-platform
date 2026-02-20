package com.cirquetask.service;

import com.cirquetask.model.dto.MemberDto;
import com.cirquetask.model.dto.ProjectDto;
import com.cirquetask.model.dto.ProjectRequest;
import com.cirquetask.model.enums.ProjectRole;

import java.util.List;

public interface ProjectService {

    ProjectDto createProject(ProjectRequest request, Long userId);

    ProjectDto getProject(Long projectId, Long userId);

    List<ProjectDto> getUserProjects(Long userId);

    ProjectDto updateProject(Long projectId, ProjectRequest request, Long userId);

    void deleteProject(Long projectId, Long userId);

    MemberDto addMember(Long projectId, Long memberUserId, ProjectRole role, Long currentUserId);

    void removeMember(Long projectId, Long memberUserId, Long currentUserId);

    MemberDto updateMemberRole(Long projectId, Long memberUserId, ProjectRole role, Long currentUserId);

    List<MemberDto> getMembers(Long projectId, Long userId);
}
