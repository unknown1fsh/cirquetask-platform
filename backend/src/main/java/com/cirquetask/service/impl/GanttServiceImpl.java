package com.cirquetask.service.impl;

import com.cirquetask.model.dto.GanttTaskDto;
import com.cirquetask.model.dto.UserDto;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.TaskDependency;
import com.cirquetask.model.enums.DependencyType;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.model.mapper.UserMapper;
import com.cirquetask.repository.TaskDependencyRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.service.GanttService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GanttServiceImpl implements GanttService {

    private final TaskRepository taskRepository;
    private final TaskDependencyRepository dependencyRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GanttTaskDto> getProjectGanttData(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return tasks.stream().map(this::toGanttDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GanttTaskDto> getSprintGanttData(Long sprintId) {
        List<Task> tasks = taskRepository.findBySprintIdOrderByPositionAsc(sprintId);
        return tasks.stream().map(this::toGanttDto).toList();
    }

    private GanttTaskDto toGanttDto(Task task) {
        List<TaskDependency> dependencies = dependencyRepository.findByTargetTaskId(task.getId());
        List<Long> dependencyIds = dependencies.stream()
                .filter(d -> d.getDependencyType() == DependencyType.BLOCKS)
                .map(d -> d.getSourceTask().getId())
                .toList();

        List<UserDto> assignees = task.getAssignees().stream()
                .map(userMapper::toDto)
                .toList();

        LocalDate startDate = task.getStartedAt() != null 
                ? task.getStartedAt().toLocalDate() 
                : task.getCreatedAt() != null ? task.getCreatedAt().toLocalDate() : LocalDate.now();

        LocalDate endDate = task.getCompletedAt() != null 
                ? task.getCompletedAt().toLocalDate() 
                : task.getDueDate();

        double progress = calculateProgress(task);

        return GanttTaskDto.builder()
                .id(task.getId())
                .taskKey(task.getTaskKey())
                .title(task.getTitle())
                .startDate(startDate)
                .endDate(endDate)
                .dueDate(task.getDueDate())
                .status(task.getStatus())
                .progress(progress)
                .parentTaskId(task.getParentTask() != null ? task.getParentTask().getId() : null)
                .dependencies(dependencyIds)
                .assignees(assignees)
                .color(getStatusColor(task.getStatus()))
                .build();
    }

    private double calculateProgress(Task task) {
        return switch (task.getStatus()) {
            case DONE -> 100.0;
            case CANCELLED -> 0.0;
            case IN_REVIEW -> 75.0;
            case IN_PROGRESS -> 50.0;
            default -> 0.0;
        };
    }

    private String getStatusColor(TaskStatus status) {
        return switch (status) {
            case DONE -> "#22c55e";
            case IN_REVIEW -> "#8b5cf6";
            case IN_PROGRESS -> "#f59e0b";
            case CANCELLED -> "#94a3b8";
            default -> "#3b82f6";
        };
    }
}
