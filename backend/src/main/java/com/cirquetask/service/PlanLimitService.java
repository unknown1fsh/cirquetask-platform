package com.cirquetask.service;

import com.cirquetask.model.entity.Project;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.enums.Feature;
import com.cirquetask.model.enums.Plan;

/**
 * Encapsulates subscription plan limits and feature flags.
 * All limit and feature checks are performed here (backend-only logic).
 */
public interface PlanLimitService {

    /**
     * Returns the effective plan for the user (e.g. FREE if subscription is not active).
     */
    Plan getEffectivePlan(User user);

    /**
     * Max projects the user can own (as owner) on their current plan.
     */
    int getMaxProjects(User user);

    /**
     * Max members allowed per project for the project owner's plan.
     */
    int getMaxMembersPerProject(Project project);

    /**
     * Whether the user can create one more project. Throws {@link com.cirquetask.exception.PlanLimitExceededException} if not.
     */
    void requireCanCreateProject(User user);

    /**
     * Whether one more member can be added to the project. Throws if not.
     */
    void requireCanAddMember(Project project);

    /**
     * Whether the user's plan includes the given feature.
     */
    boolean hasFeature(User user, Feature feature);

    /**
     * Loads user by id and throws if their plan does not include the feature.
     */
    void requireUserFeature(Long userId, Feature feature);

    /**
     * Checks that the project owner's plan includes the feature. Throws if not.
     */
    void requireProjectFeature(Project project, Feature feature);

    /**
     * Loads project by id and checks that the project owner's plan includes the feature. Throws if not.
     */
    void requireProjectFeature(Long projectId, Feature feature);

    /**
     * Loads task by id, gets its project, and checks the feature. Throws if not.
     */
    void requireTaskProjectFeature(Long taskId, Feature feature);

    /**
     * Loads time log by id, gets task's project, and checks the feature. Throws if not.
     */
    void requireTimeLogProjectFeature(Long timeLogId, Feature feature);

    /**
     * Loads custom field definition by id, gets its project, and checks the feature. Throws if not.
     */
    void requireCustomFieldDefinitionProjectFeature(Long definitionId, Feature feature);
}
