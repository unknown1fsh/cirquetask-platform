package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.SprintDto;
import com.cirquetask.model.dto.SprintRequest;
import com.cirquetask.service.SprintService;
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
@Tag(name = "Sprints", description = "Sprint management endpoints")
public class SprintController {

    private final SprintService sprintService;

    @PostMapping("/projects/{projectId}/sprints")
    @Operation(summary = "Create a new sprint")
    public ResponseEntity<ApiResponse<SprintDto>> createSprint(
            @PathVariable Long projectId,
            @Valid @RequestBody SprintRequest request) {
        SprintDto sprint = sprintService.createSprint(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sprint created", sprint));
    }

    @GetMapping("/projects/{projectId}/sprints")
    @Operation(summary = "Get all sprints for a project")
    public ResponseEntity<ApiResponse<List<SprintDto>>> getProjectSprints(@PathVariable Long projectId) {
        List<SprintDto> sprints = sprintService.getSprintsByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(sprints));
    }

    @GetMapping("/projects/{projectId}/sprints/active")
    @Operation(summary = "Get active sprint for a project")
    public ResponseEntity<ApiResponse<SprintDto>> getActiveSprint(@PathVariable Long projectId) {
        SprintDto sprint = sprintService.getActiveSprint(projectId);
        return ResponseEntity.ok(ApiResponse.success(sprint));
    }

    @GetMapping("/sprints/{sprintId}")
    @Operation(summary = "Get sprint by ID")
    public ResponseEntity<ApiResponse<SprintDto>> getSprint(@PathVariable Long sprintId) {
        SprintDto sprint = sprintService.getSprintById(sprintId);
        return ResponseEntity.ok(ApiResponse.success(sprint));
    }

    @PutMapping("/sprints/{sprintId}")
    @Operation(summary = "Update sprint")
    public ResponseEntity<ApiResponse<SprintDto>> updateSprint(
            @PathVariable Long sprintId,
            @Valid @RequestBody SprintRequest request) {
        SprintDto sprint = sprintService.updateSprint(sprintId, request);
        return ResponseEntity.ok(ApiResponse.success("Sprint updated", sprint));
    }

    @PostMapping("/sprints/{sprintId}/start")
    @Operation(summary = "Start a sprint")
    public ResponseEntity<ApiResponse<SprintDto>> startSprint(@PathVariable Long sprintId) {
        SprintDto sprint = sprintService.startSprint(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint started", sprint));
    }

    @PostMapping("/sprints/{sprintId}/complete")
    @Operation(summary = "Complete a sprint")
    public ResponseEntity<ApiResponse<SprintDto>> completeSprint(@PathVariable Long sprintId) {
        SprintDto sprint = sprintService.completeSprint(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint completed", sprint));
    }

    @DeleteMapping("/sprints/{sprintId}")
    @Operation(summary = "Delete a sprint")
    public ResponseEntity<ApiResponse<Void>> deleteSprint(@PathVariable Long sprintId) {
        sprintService.deleteSprint(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint deleted", null));
    }

    @PostMapping("/sprints/{sprintId}/tasks/{taskId}")
    @Operation(summary = "Add task to sprint")
    public ResponseEntity<ApiResponse<SprintDto>> addTaskToSprint(
            @PathVariable Long sprintId,
            @PathVariable Long taskId) {
        SprintDto sprint = sprintService.addTaskToSprint(sprintId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task added to sprint", sprint));
    }

    @DeleteMapping("/sprints/{sprintId}/tasks/{taskId}")
    @Operation(summary = "Remove task from sprint")
    public ResponseEntity<ApiResponse<SprintDto>> removeTaskFromSprint(
            @PathVariable Long sprintId,
            @PathVariable Long taskId) {
        SprintDto sprint = sprintService.removeTaskFromSprint(sprintId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task removed from sprint", sprint));
    }
}
