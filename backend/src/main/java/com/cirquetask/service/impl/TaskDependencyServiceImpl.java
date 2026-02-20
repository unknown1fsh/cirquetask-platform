package com.cirquetask.service.impl;

import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.TaskDependencyDto;
import com.cirquetask.model.dto.TaskDependencyRequest;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.TaskDependency;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.enums.DependencyType;
import com.cirquetask.model.mapper.TaskDependencyMapper;
import com.cirquetask.repository.TaskDependencyRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.TaskDependencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskDependencyServiceImpl implements TaskDependencyService {

    private final TaskDependencyRepository dependencyRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskDependencyMapper dependencyMapper;

    @Override
    @Transactional
    public TaskDependencyDto addDependency(Long sourceTaskId, TaskDependencyRequest request, Long userId) {
        Task sourceTask = findTaskById(sourceTaskId);
        Task targetTask = findTaskById(request.getTargetTaskId());
        User user = findUserById(userId);

        validateDependency(sourceTask, targetTask, request.getDependencyType());

        TaskDependency dependency = TaskDependency.builder()
                .sourceTask(sourceTask)
                .targetTask(targetTask)
                .dependencyType(request.getDependencyType())
                .createdBy(user)
                .build();

        dependency = dependencyRepository.save(dependency);
        log.info("Dependency created: {} {} {}", 
                sourceTask.getTaskKey(), request.getDependencyType(), targetTask.getTaskKey());

        return dependencyMapper.toDto(dependency);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDependencyDto> getTaskDependencies(Long taskId) {
        List<TaskDependency> dependencies = dependencyRepository.findAllByTaskId(taskId);
        return dependencyMapper.toDtoList(dependencies);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDependencyDto> getBlockingDependencies(Long taskId) {
        List<TaskDependency> dependencies = dependencyRepository.findBySourceTaskId(taskId);
        return dependencyMapper.toDtoList(dependencies.stream()
                .filter(d -> d.getDependencyType() == DependencyType.BLOCKS)
                .toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDependencyDto> getBlockedByDependencies(Long taskId) {
        List<TaskDependency> dependencies = dependencyRepository.findByTargetTaskId(taskId);
        return dependencyMapper.toDtoList(dependencies.stream()
                .filter(d -> d.getDependencyType() == DependencyType.BLOCKS)
                .toList());
    }

    @Override
    @Transactional
    public void removeDependency(Long dependencyId, Long userId) {
        TaskDependency dependency = dependencyRepository.findById(dependencyId)
                .orElseThrow(() -> new ResourceNotFoundException("TaskDependency", "id", dependencyId));

        dependencyRepository.delete(dependency);
        log.info("Dependency removed: {}", dependencyId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUnresolvedBlockers(Long taskId) {
        List<TaskDependency> blockedBy = dependencyRepository.findByTargetTaskId(taskId);
        return blockedBy.stream()
                .filter(d -> d.getDependencyType() == DependencyType.BLOCKS)
                .anyMatch(d -> {
                    Task blockingTask = d.getSourceTask();
                    return blockingTask.getStatus() != com.cirquetask.model.enums.TaskStatus.DONE 
                            && blockingTask.getStatus() != com.cirquetask.model.enums.TaskStatus.CANCELLED;
                });
    }

    private void validateDependency(Task sourceTask, Task targetTask, DependencyType type) {
        if (sourceTask.getId().equals(targetTask.getId())) {
            throw new BadRequestException("A task cannot depend on itself");
        }

        if (!sourceTask.getProject().getId().equals(targetTask.getProject().getId())) {
            throw new BadRequestException("Dependencies can only be created between tasks in the same project");
        }

        boolean exists = dependencyRepository.existsBySourceTaskIdAndTargetTaskIdAndDependencyType(
                sourceTask.getId(), targetTask.getId(), type);
        if (exists) {
            throw new BadRequestException("This dependency already exists");
        }

        if (type == DependencyType.BLOCKS) {
            boolean reverseExists = dependencyRepository.existsBySourceTaskIdAndTargetTaskIdAndDependencyType(
                    targetTask.getId(), sourceTask.getId(), DependencyType.BLOCKS);
            if (reverseExists) {
                throw new BadRequestException("Circular dependency detected");
            }
        }
    }

    private Task findTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
