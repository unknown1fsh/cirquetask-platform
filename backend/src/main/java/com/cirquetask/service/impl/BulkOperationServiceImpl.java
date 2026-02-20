package com.cirquetask.service.impl;

import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.BulkUpdateRequest;
import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.model.entity.*;
import com.cirquetask.model.mapper.TaskMapper;
import com.cirquetask.repository.*;
import com.cirquetask.service.BulkOperationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkOperationServiceImpl implements BulkOperationService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final SprintRepository sprintRepository;
    private final BoardColumnRepository columnRepository;
    private final TaskMapper taskMapper;

    @Override
    @Transactional
    public List<TaskDto> bulkUpdateTasks(BulkUpdateRequest request, Long userId) {
        List<Task> tasks = taskRepository.findAllById(request.getTaskIds());

        for (Task task : tasks) {
            if (request.getStatus() != null) {
                task.setStatus(request.getStatus());
            }
            if (request.getPriority() != null) {
                task.setPriority(request.getPriority());
            }
            if (request.getAssigneeIds() != null) {
                Set<User> assignees = new HashSet<>(userRepository.findAllById(request.getAssigneeIds()));
                task.setAssignees(assignees);
            }
            if (request.getLabelIds() != null) {
                Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
                task.setLabels(labels);
            }
            if (request.getSprintId() != null) {
                Sprint sprint = sprintRepository.findById(request.getSprintId()).orElse(null);
                task.setSprint(sprint);
            }
            if (request.getColumnId() != null) {
                BoardColumn column = columnRepository.findById(request.getColumnId()).orElse(null);
                task.setColumn(column);
            }
        }

        tasks = taskRepository.saveAll(tasks);
        log.info("Bulk updated {} tasks by user {}", tasks.size(), userId);

        return tasks.stream().map(taskMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void bulkDeleteTasks(Set<Long> taskIds, Long userId) {
        taskRepository.deleteAllById(taskIds);
        log.info("Bulk deleted {} tasks by user {}", taskIds.size(), userId);
    }

    @Override
    @Transactional
    public List<TaskDto> bulkMoveToSprint(Set<Long> taskIds, Long sprintId, Long userId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        List<Task> tasks = taskRepository.findAllById(taskIds);
        for (Task task : tasks) {
            task.setSprint(sprint);
        }

        tasks = taskRepository.saveAll(tasks);
        log.info("Bulk moved {} tasks to sprint {} by user {}", tasks.size(), sprintId, userId);

        return tasks.stream().map(taskMapper::toDto).toList();
    }

    @Override
    @Transactional
    public List<TaskDto> bulkMoveToColumn(Set<Long> taskIds, Long columnId, Long userId) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("BoardColumn", "id", columnId));

        List<Task> tasks = taskRepository.findAllById(taskIds);
        int position = column.getTasks().size();

        for (Task task : tasks) {
            task.setColumn(column);
            task.setPosition(position++);
        }

        tasks = taskRepository.saveAll(tasks);
        log.info("Bulk moved {} tasks to column {} by user {}", tasks.size(), columnId, userId);

        return tasks.stream().map(taskMapper::toDto).toList();
    }
}
