package com.cirquetask.service.impl;

import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.WorkflowRuleDto;
import com.cirquetask.model.dto.WorkflowRuleRequest;
import com.cirquetask.model.entity.*;
import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.model.enums.WorkflowAction;
import com.cirquetask.model.enums.WorkflowTrigger;
import com.cirquetask.model.mapper.WorkflowRuleMapper;
import com.cirquetask.repository.*;
import com.cirquetask.service.NotificationService;
import com.cirquetask.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowServiceImpl implements WorkflowService {

    private final WorkflowRuleRepository ruleRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final BoardColumnRepository columnRepository;
    private final WorkflowRuleMapper ruleMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public WorkflowRuleDto createRule(Long projectId, WorkflowRuleRequest request, Long userId) {
        Project project = findProjectById(projectId);
        User user = findUserById(userId);

        WorkflowRule rule = WorkflowRule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .project(project)
                .trigger(request.getTrigger())
                .triggerValue(request.getTriggerValue())
                .action(request.getAction())
                .actionValue(request.getActionValue())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdBy(user)
                .build();

        rule = ruleRepository.save(rule);
        log.info("Workflow rule created: {} for project {}", rule.getName(), projectId);

        return ruleMapper.toDto(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkflowRuleDto> getProjectRules(Long projectId) {
        List<WorkflowRule> rules = ruleRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return ruleMapper.toDtoList(rules);
    }

    @Override
    @Transactional
    public WorkflowRuleDto updateRule(Long ruleId, WorkflowRuleRequest request, Long userId) {
        WorkflowRule rule = findRuleById(ruleId);

        rule.setName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setTrigger(request.getTrigger());
        rule.setTriggerValue(request.getTriggerValue());
        rule.setAction(request.getAction());
        rule.setActionValue(request.getActionValue());
        if (request.getIsActive() != null) {
            rule.setIsActive(request.getIsActive());
        }

        rule = ruleRepository.save(rule);
        log.info("Workflow rule updated: {}", ruleId);

        return ruleMapper.toDto(rule);
    }

    @Override
    @Transactional
    public void deleteRule(Long ruleId, Long userId) {
        WorkflowRule rule = findRuleById(ruleId);
        ruleRepository.delete(rule);
        log.info("Workflow rule deleted: {}", ruleId);
    }

    @Override
    @Transactional
    public WorkflowRuleDto toggleRule(Long ruleId, Long userId) {
        WorkflowRule rule = findRuleById(ruleId);
        rule.setIsActive(!rule.getIsActive());
        rule = ruleRepository.save(rule);
        log.info("Workflow rule {} toggled to: {}", ruleId, rule.getIsActive());
        return ruleMapper.toDto(rule);
    }

    @Override
    @Async
    @Transactional
    public void executeWorkflows(Task task, WorkflowTrigger trigger, String triggerValue) {
        List<WorkflowRule> rules = ruleRepository.findByProjectIdAndTriggerAndIsActiveTrue(
                task.getProject().getId(), trigger);

        for (WorkflowRule rule : rules) {
            if (matchesTriggerValue(rule, triggerValue)) {
                try {
                    executeAction(task, rule);
                    log.info("Workflow rule {} executed for task {}", rule.getName(), task.getTaskKey());
                } catch (Exception e) {
                    log.error("Failed to execute workflow rule {} for task {}: {}", 
                            rule.getName(), task.getTaskKey(), e.getMessage());
                }
            }
        }
    }

    private boolean matchesTriggerValue(WorkflowRule rule, String triggerValue) {
        if (rule.getTriggerValue() == null || rule.getTriggerValue().isBlank()) {
            return true;
        }
        return rule.getTriggerValue().equalsIgnoreCase(triggerValue);
    }

    private void executeAction(Task task, WorkflowRule rule) {
        WorkflowAction action = rule.getAction();
        String actionValue = rule.getActionValue();

        switch (action) {
            case ASSIGN_USER -> assignUserToTask(task, actionValue);
            case UNASSIGN_USER -> unassignUserFromTask(task, actionValue);
            case CHANGE_STATUS -> changeTaskStatus(task, actionValue);
            case CHANGE_PRIORITY -> changeTaskPriority(task, actionValue);
            case ADD_LABEL -> addLabelToTask(task, actionValue);
            case REMOVE_LABEL -> removeLabelFromTask(task, actionValue);
            case SEND_NOTIFICATION -> sendNotification(task, rule);
            case MOVE_TO_COLUMN -> moveTaskToColumn(task, actionValue);
        }

        taskRepository.save(task);
    }

    private void assignUserToTask(Task task, String userId) {
        User user = userRepository.findById(Long.parseLong(userId)).orElse(null);
        if (user != null) {
            task.getAssignees().add(user);
        }
    }

    private void unassignUserFromTask(Task task, String userId) {
        task.getAssignees().removeIf(u -> u.getId().equals(Long.parseLong(userId)));
    }

    private void changeTaskStatus(Task task, String status) {
        task.setStatus(TaskStatus.valueOf(status));
    }

    private void changeTaskPriority(Task task, String priority) {
        task.setPriority(TaskPriority.valueOf(priority));
    }

    private void addLabelToTask(Task task, String labelId) {
        Label label = labelRepository.findById(Long.parseLong(labelId)).orElse(null);
        if (label != null) {
            task.getLabels().add(label);
        }
    }

    private void removeLabelFromTask(Task task, String labelId) {
        task.getLabels().removeIf(l -> l.getId().equals(Long.parseLong(labelId)));
    }

    private void sendNotification(Task task, WorkflowRule rule) {
        for (User assignee : task.getAssignees()) {
            notificationService.sendTaskUpdated(task, assignee, "Workflow: " + rule.getName());
        }
    }

    private void moveTaskToColumn(Task task, String columnId) {
        BoardColumn column = columnRepository.findById(Long.parseLong(columnId)).orElse(null);
        if (column != null) {
            task.setColumn(column);
        }
    }

    private WorkflowRule findRuleById(Long ruleId) {
        return ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowRule", "id", ruleId));
    }

    private Project findProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
