package com.cirquetask.service;

import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.model.dto.TaskMoveRequest;
import com.cirquetask.model.dto.TaskRequest;

import java.util.List;

public interface TaskService {

    TaskDto createTask(Long projectId, TaskRequest request, Long userId);

    TaskDto getTask(Long taskId, Long userId);

    List<TaskDto> getProjectTasks(Long projectId, Long userId, com.cirquetask.model.enums.TaskStatus status, com.cirquetask.model.enums.TaskPriority priority, Long assigneeId);

    List<TaskDto> getMyTasks(Long userId);

    TaskDto updateTask(Long taskId, TaskRequest request, Long userId);

    TaskDto moveTask(Long taskId, TaskMoveRequest moveRequest, Long userId);

    void deleteTask(Long taskId, Long userId);

    TaskDto assignUser(Long taskId, Long assigneeId, Long userId);

    TaskDto unassignUser(Long taskId, Long assigneeId, Long userId);

    TaskDto addLabelToTask(Long taskId, Long labelId, Long userId);

    TaskDto removeLabelFromTask(Long taskId, Long labelId, Long userId);
}
