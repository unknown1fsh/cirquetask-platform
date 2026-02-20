package com.cirquetask.service;

import com.cirquetask.model.dto.WorkflowRuleDto;
import com.cirquetask.model.dto.WorkflowRuleRequest;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.enums.WorkflowTrigger;

import java.util.List;

public interface WorkflowService {

    WorkflowRuleDto createRule(Long projectId, WorkflowRuleRequest request, Long userId);

    List<WorkflowRuleDto> getProjectRules(Long projectId);

    WorkflowRuleDto updateRule(Long ruleId, WorkflowRuleRequest request, Long userId);

    void deleteRule(Long ruleId, Long userId);

    WorkflowRuleDto toggleRule(Long ruleId, Long userId);

    void executeWorkflows(Task task, WorkflowTrigger trigger, String triggerValue);
}
