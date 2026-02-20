package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.LabelDto;
import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.model.entity.Label;
import com.cirquetask.model.entity.Task;
import org.mapstruct.AfterMapping;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {UserMapper.class})
public interface TaskMapper {

    @Mapping(target = "columnId", source = "column.id")
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "parentTaskId", source = "parentTask.id")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "sprintName", source = "sprint.name")
    @Mapping(target = "commentCount", expression = "java(task.getComments() != null ? task.getComments().size() : 0)")
    @Mapping(target = "attachmentCount", expression = "java(task.getAttachments() != null ? task.getAttachments().size() : 0)")
    @Mapping(target = "subtasks", ignore = true)
    TaskDto toDto(Task task);

    @Named("noSubtasks")
    @Mapping(target = "columnId", source = "column.id")
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "parentTaskId", source = "parentTask.id")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "sprintName", source = "sprint.name")
    @Mapping(target = "commentCount", expression = "java(task.getComments() != null ? task.getComments().size() : 0)")
    @Mapping(target = "attachmentCount", expression = "java(task.getAttachments() != null ? task.getAttachments().size() : 0)")
    @Mapping(target = "subtasks", ignore = true)
    TaskDto toDtoNoSubtasks(Task task);

    @IterableMapping(qualifiedByName = "noSubtasks")
    List<TaskDto> toDtoList(List<Task> tasks);

    LabelDto toLabelDto(Label label);

    @AfterMapping
    default void setSubtasks(@MappingTarget TaskDto dto, Task task) {
        if (task.getSubtasks() != null && !task.getSubtasks().isEmpty()) {
            dto.setSubtasks(task.getSubtasks().stream().map(this::toDtoNoSubtasks).toList());
        }
    }
}
