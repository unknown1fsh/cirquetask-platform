package com.cirquetask.service.impl;

import com.cirquetask.exception.PlanLimitExceededException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.entity.User;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.model.enums.Feature;
import com.cirquetask.model.enums.Plan;
import com.cirquetask.model.entity.CustomFieldDefinition;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.TimeLog;
import com.cirquetask.repository.CustomFieldDefinitionRepository;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.repository.ProjectRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.repository.TimeLogRepository;
import com.cirquetask.service.PlanLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PlanLimitServiceImpl implements PlanLimitService {

    private static final int FREE_MAX_PROJECTS = 2;
    private static final int FREE_MAX_MEMBERS_PER_PROJECT = 5;
    private static final int PRO_MAX_PROJECTS = 10;
    private static final int PRO_MAX_MEMBERS_PER_PROJECT = 15;
    private static final String SUBSCRIPTION_ACTIVE = "active";

    private static final Set<Feature> PRO_FEATURES = EnumSet.of(
            Feature.GANTT, Feature.REPORTS, Feature.CUSTOM_FIELDS, Feature.TIME_LOG
    );
    private static final Set<Feature> BUSINESS_FEATURES = EnumSet.allOf(Feature.class);

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;
    private final UserRepository userRepository;
    private final CustomFieldDefinitionRepository customFieldDefinitionRepository;

    @Override
    public Plan getEffectivePlan(User user) {
        if (user == null || user.getPlan() == null || user.getPlan() == Plan.FREE) {
            return Plan.FREE;
        }
        if (SUBSCRIPTION_ACTIVE.equals(user.getSubscriptionStatus())) {
            return user.getPlan();
        }
        return Plan.FREE;
    }

    @Override
    public int getMaxProjects(User user) {
        Plan plan = getEffectivePlan(user);
        return switch (plan) {
            case FREE -> FREE_MAX_PROJECTS;
            case PRO -> PRO_MAX_PROJECTS;
            case BUSINESS -> Integer.MAX_VALUE;
        };
    }

    @Override
    public int getMaxMembersPerProject(Project project) {
        if (project == null || project.getOwner() == null) {
            return FREE_MAX_MEMBERS_PER_PROJECT;
        }
        Plan plan = getEffectivePlan(project.getOwner());
        return switch (plan) {
            case FREE -> FREE_MAX_MEMBERS_PER_PROJECT;
            case PRO -> PRO_MAX_MEMBERS_PER_PROJECT;
            case BUSINESS -> Integer.MAX_VALUE;
        };
    }

    @Override
    public void requireCanCreateProject(User user) {
        Plan plan = getEffectivePlan(user);
        int max = getMaxProjects(user);
        long current = projectRepository.countByOwnerIdAndIsArchivedFalse(user.getId());
        if (current >= max) {
            throw new PlanLimitExceededException(
                    "Plan limit reached: you can have up to " + max + " project(s). Upgrade to add more.");
        }
    }

    @Override
    public void requireCanAddMember(Project project) {
        int max = getMaxMembersPerProject(project);
        long current = projectMemberRepository.countByProjectId(project.getId());
        if (current >= max) {
            throw new PlanLimitExceededException(
                    "Plan limit reached: this project can have up to " + max + " member(s). Upgrade to add more.");
        }
    }

    @Override
    public boolean hasFeature(User user, Feature feature) {
        Plan plan = getEffectivePlan(user);
        return switch (plan) {
            case FREE -> false;
            case PRO -> PRO_FEATURES.contains(feature);
            case BUSINESS -> BUSINESS_FEATURES.contains(feature);
        };
    }

    @Override
    public void requireProjectFeature(Project project, Feature feature) {
        if (project == null || project.getOwner() == null) {
            throw new PlanLimitExceededException("This feature is not available. Please upgrade your plan.");
        }
        if (!hasFeature(project.getOwner(), feature)) {
            throw new PlanLimitExceededException(
                    "This feature is available on Pro plan and above. Please upgrade your plan.");
        }
    }

    @Override
    public void requireUserFeature(Long userId, Feature feature) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (!hasFeature(user, feature)) {
            throw new PlanLimitExceededException(
                    "This feature is available on Pro plan and above. Please upgrade your plan.");
        }
    }

    @Override
    public void requireProjectFeature(Long projectId, Feature feature) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        requireProjectFeature(project, feature);
    }

    @Override
    public void requireTaskProjectFeature(Long taskId, Feature feature) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        requireProjectFeature(task.getProject(), feature);
    }

    @Override
    public void requireTimeLogProjectFeature(Long timeLogId, Feature feature) {
        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeLog", "id", timeLogId));
        requireProjectFeature(timeLog.getTask().getProject(), feature);
    }

    @Override
    public void requireCustomFieldDefinitionProjectFeature(Long definitionId, Feature feature) {
        CustomFieldDefinition definition = customFieldDefinitionRepository.findById(definitionId)
                .orElseThrow(() -> new ResourceNotFoundException("CustomFieldDefinition", "id", definitionId));
        requireProjectFeature(definition.getProject(), feature);
    }
}
