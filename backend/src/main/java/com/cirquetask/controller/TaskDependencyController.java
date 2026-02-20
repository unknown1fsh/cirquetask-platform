package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.TaskDependencyDto;
import com.cirquetask.model.dto.TaskDependencyRequest;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.TaskDependencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Task Dependencies", description = "Task dependency management endpoints")
public class TaskDependencyController {

    private final TaskDependencyService dependencyService;

    @PostMapping("/tasks/{taskId}/dependencies")
    @Operation(summary = "Add a dependency to a task")
    public ResponseEntity<ApiResponse<TaskDependencyDto>> addDependency(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDependencyRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        TaskDependencyDto dependency = dependencyService.addDependency(taskId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dependency added", dependency));
    }

    @GetMapping("/tasks/{taskId}/dependencies")
    @Operation(summary = "Get all dependencies for a task")
    public ResponseEntity<ApiResponse<List<TaskDependencyDto>>> getTaskDependencies(@PathVariable Long taskId) {
        List<TaskDependencyDto> dependencies = dependencyService.getTaskDependencies(taskId);
        return ResponseEntity.ok(ApiResponse.success(dependencies));
    }

    @GetMapping("/tasks/{taskId}/dependencies/blocking")
    @Operation(summary = "Get tasks that this task blocks")
    public ResponseEntity<ApiResponse<List<TaskDependencyDto>>> getBlockingDependencies(@PathVariable Long taskId) {
        List<TaskDependencyDto> dependencies = dependencyService.getBlockingDependencies(taskId);
        return ResponseEntity.ok(ApiResponse.success(dependencies));
    }

    @GetMapping("/tasks/{taskId}/dependencies/blocked-by")
    @Operation(summary = "Get tasks that block this task")
    public ResponseEntity<ApiResponse<List<TaskDependencyDto>>> getBlockedByDependencies(@PathVariable Long taskId) {
        List<TaskDependencyDto> dependencies = dependencyService.getBlockedByDependencies(taskId);
        return ResponseEntity.ok(ApiResponse.success(dependencies));
    }

    @GetMapping("/tasks/{taskId}/dependencies/has-blockers")
    @Operation(summary = "Check if task has unresolved blockers")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> hasUnresolvedBlockers(@PathVariable Long taskId) {
        boolean hasBlockers = dependencyService.hasUnresolvedBlockers(taskId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("hasBlockers", hasBlockers)));
    }

    @DeleteMapping("/dependencies/{dependencyId}")
    @Operation(summary = "Remove a dependency")
    public ResponseEntity<ApiResponse<Void>> removeDependency(@PathVariable Long dependencyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        dependencyService.removeDependency(dependencyId, userId);
        return ResponseEntity.ok(ApiResponse.success("Dependency removed", null));
    }
}
