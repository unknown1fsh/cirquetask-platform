package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.MemberDto;
import com.cirquetask.model.dto.ProjectDto;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.entity.ProjectMember;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {UserMapper.class})
public interface ProjectMapper {

    @Mapping(target = "memberCount", expression = "java(project.getMembers() != null ? project.getMembers().size() : 0)")
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "taskCount", ignore = true)
    ProjectDto toDto(Project project);

    List<ProjectDto> toDtoList(List<Project> projects);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    MemberDto toMemberDto(ProjectMember member);

    List<MemberDto> toMemberDtoList(List<ProjectMember> members);
}
