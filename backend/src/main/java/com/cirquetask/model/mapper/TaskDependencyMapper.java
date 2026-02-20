package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.TaskDependencyDto;
import com.cirquetask.model.entity.TaskDependency;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TaskDependencyMapper {

    private final UserMapper userMapper;

    public TaskDependencyDto toDto(TaskDependency dependency) {
        if (dependency == null) {
            return null;
        }

        return TaskDependencyDto.builder()
                .id(dependency.getId())
                .sourceTaskId(dependency.getSourceTask().getId())
                .sourceTaskKey(dependency.getSourceTask().getTaskKey())
                .sourceTaskTitle(dependency.getSourceTask().getTitle())
                .targetTaskId(dependency.getTargetTask().getId())
                .targetTaskKey(dependency.getTargetTask().getTaskKey())
                .targetTaskTitle(dependency.getTargetTask().getTitle())
                .dependencyType(dependency.getDependencyType())
                .createdBy(dependency.getCreatedBy() != null ? userMapper.toDto(dependency.getCreatedBy()) : null)
                .createdAt(dependency.getCreatedAt())
                .build();
    }

    public List<TaskDependencyDto> toDtoList(List<TaskDependency> dependencies) {
        return dependencies.stream().map(this::toDto).toList();
    }
}
