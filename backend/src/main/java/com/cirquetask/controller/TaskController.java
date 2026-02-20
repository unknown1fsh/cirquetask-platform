package com.cirquetask.controller;

import com.cirquetask.model.dto.*;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.TaskService;
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
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/projects/{projectId}/tasks")
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskDto>> createTask(@PathVariable Long projectId, @Valid @RequestBody TaskRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        TaskDto task = taskService.createTask(projectId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Task created", task));
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get task details")
    public ResponseEntity<ApiResponse<TaskDto>> getTask(@PathVariable Long taskId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(taskService.getTask(taskId, userId)));
    }

    @GetMapping("/projects/{projectId}/tasks")
    @Operation(summary = "Get all tasks for a project")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getProjectTasks(
            @PathVariable Long projectId,
            @RequestParam(required = false) com.cirquetask.model.enums.TaskStatus status,
            @RequestParam(required = false) com.cirquetask.model.enums.TaskPriority priority,
            @RequestParam(required = false) Long assigneeId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(taskService.getProjectTasks(projectId, userId, status, priority, assigneeId)));
    }

    @GetMapping("/tasks/my")
    @Operation(summary = "Get tasks assigned to current user")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getMyTasks() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(taskService.getMyTasks(userId)));
    }

    @PutMapping("/tasks/{taskId}")
    @Operation(summary = "Update task")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(@PathVariable Long taskId, @Valid @RequestBody TaskRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        TaskDto task = taskService.updateTask(taskId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Task updated", task));
    }

    @PatchMapping("/tasks/{taskId}/move")
    @Operation(summary = "Move task to another column (Kanban)")
    public ResponseEntity<ApiResponse<TaskDto>> moveTask(@PathVariable Long taskId, @Valid @RequestBody TaskMoveRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        TaskDto task = taskService.moveTask(taskId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Task moved", task));
    }

    @DeleteMapping("/tasks/{taskId}")
    @Operation(summary = "Delete task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        Long userId = SecurityUtils.getCurrentUserId();
        taskService.deleteTask(taskId, userId);
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }

    @PostMapping("/tasks/{taskId}/assign/{assigneeId}")
    @Operation(summary = "Assign user to task")
    public ResponseEntity<ApiResponse<TaskDto>> assignUser(@PathVariable Long taskId, @PathVariable Long assigneeId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(taskService.assignUser(taskId, assigneeId, userId)));
    }

    @DeleteMapping("/tasks/{taskId}/assign/{assigneeId}")
    @Operation(summary = "Unassign user from task")
    public ResponseEntity<ApiResponse<TaskDto>> unassignUser(@PathVariable Long taskId, @PathVariable Long assigneeId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(taskService.unassignUser(taskId, assigneeId, userId)));
    }

    @PostMapping("/tasks/{taskId}/labels/{labelId}")
    @Operation(summary = "Add label to task")
    public ResponseEntity<ApiResponse<TaskDto>> addLabel(@PathVariable Long taskId, @PathVariable Long labelId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(taskService.addLabelToTask(taskId, labelId, userId)));
    }

    @DeleteMapping("/tasks/{taskId}/labels/{labelId}")
    @Operation(summary = "Remove label from task")
    public ResponseEntity<ApiResponse<TaskDto>> removeLabel(@PathVariable Long taskId, @PathVariable Long labelId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(taskService.removeLabelFromTask(taskId, labelId, userId)));
    }
}
