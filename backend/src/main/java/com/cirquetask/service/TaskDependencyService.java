package com.cirquetask.service;

import com.cirquetask.model.dto.TaskDependencyDto;
import com.cirquetask.model.dto.TaskDependencyRequest;

import java.util.List;

public interface TaskDependencyService {

    TaskDependencyDto addDependency(Long sourceTaskId, TaskDependencyRequest request, Long userId);

    List<TaskDependencyDto> getTaskDependencies(Long taskId);

    List<TaskDependencyDto> getBlockingDependencies(Long taskId);

    List<TaskDependencyDto> getBlockedByDependencies(Long taskId);

    void removeDependency(Long dependencyId, Long userId);

    boolean hasUnresolvedBlockers(Long taskId);
}
