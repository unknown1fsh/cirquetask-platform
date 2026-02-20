package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.WorkflowRuleDto;
import com.cirquetask.model.dto.WorkflowRuleRequest;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Workflow Automation", description = "Workflow rule management endpoints")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping("/projects/{projectId}/workflows")
    @Operation(summary = "Create a workflow rule")
    public ResponseEntity<ApiResponse<WorkflowRuleDto>> createRule(
            @PathVariable Long projectId,
            @Valid @RequestBody WorkflowRuleRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        WorkflowRuleDto rule = workflowService.createRule(projectId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workflow rule created", rule));
    }

    @GetMapping("/projects/{projectId}/workflows")
    @Operation(summary = "Get all workflow rules for a project")
    public ResponseEntity<ApiResponse<List<WorkflowRuleDto>>> getProjectRules(@PathVariable Long projectId) {
        List<WorkflowRuleDto> rules = workflowService.getProjectRules(projectId);
        return ResponseEntity.ok(ApiResponse.success(rules));
    }

    @PutMapping("/workflows/{ruleId}")
    @Operation(summary = "Update a workflow rule")
    public ResponseEntity<ApiResponse<WorkflowRuleDto>> updateRule(
            @PathVariable Long ruleId,
            @Valid @RequestBody WorkflowRuleRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        WorkflowRuleDto rule = workflowService.updateRule(ruleId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Workflow rule updated", rule));
    }

    @PostMapping("/workflows/{ruleId}/toggle")
    @Operation(summary = "Toggle workflow rule active status")
    public ResponseEntity<ApiResponse<WorkflowRuleDto>> toggleRule(@PathVariable Long ruleId) {
        Long userId = SecurityUtils.getCurrentUserId();
        WorkflowRuleDto rule = workflowService.toggleRule(ruleId, userId);
        return ResponseEntity.ok(ApiResponse.success("Workflow rule toggled", rule));
    }

    @DeleteMapping("/workflows/{ruleId}")
    @Operation(summary = "Delete a workflow rule")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long ruleId) {
        Long userId = SecurityUtils.getCurrentUserId();
        workflowService.deleteRule(ruleId, userId);
        return ResponseEntity.ok(ApiResponse.success("Workflow rule deleted", null));
    }
}
