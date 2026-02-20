package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.model.dto.TaskMoveRequest;
import com.cirquetask.model.dto.TaskRequest;
import com.cirquetask.model.entity.*;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.model.mapper.TaskMapper;
import com.cirquetask.repository.*;
import com.cirquetask.service.ActivityLogService;
import com.cirquetask.service.NotificationService;
import com.cirquetask.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final BoardColumnRepository columnRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final TaskMapper taskMapper;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public TaskDto createTask(Long projectId, TaskRequest request, Long userId) {
        validateMembership(projectId, userId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        User reporter = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Generate task key
        Integer maxNumber = taskRepository.findMaxTaskNumberByProjectId(projectId);
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        String taskKey = project.getPrefix() + "-" + nextNumber;

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .taskKey(taskKey)
                .priority(request.getPriority() != null ? request.getPriority() : com.cirquetask.model.enums.TaskPriority.MEDIUM)
                .type(request.getType() != null ? request.getType() : com.cirquetask.model.enums.TaskType.TASK)
                .storyPoints(request.getStoryPoints() != null ? request.getStoryPoints() : 0)
                .project(project)
                .reporter(reporter)
                .dueDate(request.getDueDate())
                .build();

        // Set column
        if (request.getColumnId() != null) {
            BoardColumn column = columnRepository.findById(request.getColumnId())
                    .orElseThrow(() -> new ResourceNotFoundException("BoardColumn", "id", request.getColumnId()));
            task.setColumn(column);
            task.setPosition(column.getTasks().size());
        }

        // Set parent task
        if (request.getParentTaskId() != null) {
            Task parent = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getParentTaskId()));
            task.setParentTask(parent);
        }

        task = taskRepository.save(task);

        // Set assignees
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            Set<User> assignees = new HashSet<>(userRepository.findAllById(request.getAssigneeIds()));
            task.setAssignees(assignees);
            task = taskRepository.save(task);

            // Notify assignees
            for (User assignee : assignees) {
                if (!assignee.getId().equals(userId)) {
                    notificationService.sendTaskAssigned(task, assignee, reporter);
                }
            }
        }

        // Set labels
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            task.setLabels(labels);
            task = taskRepository.save(task);
        }

        activityLogService.log("CREATE", "TASK", task.getId(),
                "Created task: " + taskKey, null, null, userId, projectId);

        return taskMapper.toDto(task);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDto getTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);
        return taskMapper.toDto(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getProjectTasks(Long projectId, Long userId, com.cirquetask.model.enums.TaskStatus status, com.cirquetask.model.enums.TaskPriority priority, Long assigneeId) {
        validateMembership(projectId, userId);
        List<Task> tasks;
        if (status == null && priority == null && assigneeId == null) {
            tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        } else {
            String statusStr = status != null ? status.name() : null;
            String priorityStr = priority != null ? priority.name() : null;
            tasks = taskRepository.findByProjectIdWithFilters(projectId, statusStr, priorityStr, assigneeId);
        }
        return taskMapper.toDtoList(tasks);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getMyTasks(Long userId) {
        List<Task> tasks = taskRepository.findActiveTasksByAssigneeId(userId);
        return taskMapper.toDtoList(tasks);
    }

    @Override
    @Transactional
    public TaskDto updateTask(Long taskId, TaskRequest request, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);

        String oldTitle = task.getTitle();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getType() != null) task.setType(request.getType());
        if (request.getStoryPoints() != null) task.setStoryPoints(request.getStoryPoints());
        task.setDueDate(request.getDueDate());

        if (request.getColumnId() != null) {
            BoardColumn column = columnRepository.findById(request.getColumnId())
                    .orElseThrow(() -> new ResourceNotFoundException("BoardColumn", "id", request.getColumnId()));
            task.setColumn(column);

            if (column.getIsDoneColumn()) {
                task.setStatus(TaskStatus.DONE);
                task.setCompletedAt(LocalDateTime.now());
            }
        }

        if (request.getAssigneeIds() != null) {
            Set<User> assignees = new HashSet<>(userRepository.findAllById(request.getAssigneeIds()));
            task.setAssignees(assignees);
        }

        if (request.getLabelIds() != null) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            task.setLabels(labels);
        }

        task = taskRepository.save(task);

        activityLogService.log("UPDATE", "TASK", task.getId(),
                "Updated task: " + task.getTaskKey(), oldTitle, task.getTitle(), userId, task.getProject().getId());

        return taskMapper.toDto(task);
    }

    @Override
    @Transactional
    public TaskDto moveTask(Long taskId, TaskMoveRequest moveRequest, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);

        BoardColumn targetColumn = columnRepository.findById(moveRequest.getColumnId())
                .orElseThrow(() -> new ResourceNotFoundException("BoardColumn", "id", moveRequest.getColumnId()));

        // WIP Limit check
        validateWipLimit(targetColumn, task);

        String oldColumnName = task.getColumn() != null ? task.getColumn().getName() : "none";

        task.setColumn(targetColumn);
        task.setPosition(moveRequest.getPosition());

        // Update status based on column
        if (targetColumn.getIsDoneColumn()) {
            task.setStatus(TaskStatus.DONE);
            task.setCompletedAt(LocalDateTime.now());
        } else if (targetColumn.getName().toLowerCase().contains("progress")) {
            task.setStatus(TaskStatus.IN_PROGRESS);
            if (task.getStartedAt() == null) task.setStartedAt(LocalDateTime.now());
        } else if (targetColumn.getName().toLowerCase().contains("review")) {
            task.setStatus(TaskStatus.IN_REVIEW);
        }

        task = taskRepository.save(task);

        // Reorder other tasks in target column
        List<Task> columnTasks = taskRepository.findByColumnIdOrderByPositionAsc(targetColumn.getId());
        int pos = 0;
        for (Task t : columnTasks) {
            if (!t.getId().equals(task.getId())) {
                if (pos == moveRequest.getPosition()) pos++;
                t.setPosition(pos++);
                taskRepository.save(t);
            }
        }

        activityLogService.log("MOVE", "TASK", task.getId(),
                "Moved task " + task.getTaskKey() + " from " + oldColumnName + " to " + targetColumn.getName(),
                oldColumnName, targetColumn.getName(), userId, task.getProject().getId());

        return taskMapper.toDto(task);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);

        activityLogService.log("DELETE", "TASK", task.getId(),
                "Deleted task: " + task.getTaskKey(), null, null, userId, task.getProject().getId());

        taskRepository.delete(task);
    }

    @Override
    @Transactional
    public TaskDto assignUser(Long taskId, Long assigneeId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", assigneeId));
        User assigner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        task.getAssignees().add(assignee);
        task = taskRepository.save(task);

        if (!assigneeId.equals(userId)) {
            notificationService.sendTaskAssigned(task, assignee, assigner);
        }

        return taskMapper.toDto(task);
    }

    @Override
    @Transactional
    public TaskDto unassignUser(Long taskId, Long assigneeId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);

        task.getAssignees().removeIf(u -> u.getId().equals(assigneeId));
        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    @Override
    @Transactional
    public TaskDto addLabelToTask(Long taskId, Long labelId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId));
        if (!label.getProject().getId().equals(task.getProject().getId())) {
            throw new BadRequestException("Label does not belong to the task's project");
        }
        task.getLabels().add(label);
        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    @Override
    @Transactional
    public TaskDto removeLabelFromTask(Long taskId, Long labelId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);
        task.getLabels().removeIf(l -> l.getId().equals(labelId));
        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    private void validateMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new AccessDeniedException("You are not a member of this project");
        }
    }

    private void validateWipLimit(BoardColumn column, Task taskBeingMoved) {
        if (column.getWipLimit() == null || column.getWipLimit() <= 0) {
            return;
        }

        long currentTaskCount = column.getTasks().stream()
                .filter(t -> !t.getId().equals(taskBeingMoved.getId()))
                .count();

        if (currentTaskCount >= column.getWipLimit()) {
            throw new BadRequestException(
                    String.format("WIP limit exceeded for column '%s'. Maximum: %d, Current: %d",
                            column.getName(), column.getWipLimit(), currentTaskCount));
        }
    }
}
