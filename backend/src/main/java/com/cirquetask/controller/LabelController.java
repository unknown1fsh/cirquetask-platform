package com.cirquetask.controller;

import com.cirquetask.model.dto.*;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.LabelService;
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
@Tag(name = "Labels", description = "Project label management")
public class LabelController {

    private final LabelService labelService;

    @GetMapping("/projects/{projectId}/labels")
    @Operation(summary = "List labels for project")
    public ResponseEntity<ApiResponse<List<LabelDto>>> listByProject(@PathVariable Long projectId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(labelService.listByProjectId(projectId, userId)));
    }

    @PostMapping("/projects/{projectId}/labels")
    @Operation(summary = "Create label")
    public ResponseEntity<ApiResponse<LabelDto>> create(@PathVariable Long projectId, @Valid @RequestBody LabelRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        LabelDto dto = labelService.create(projectId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Label created", dto));
    }

    @PutMapping("/labels/{labelId}")
    @Operation(summary = "Update label")
    public ResponseEntity<ApiResponse<LabelDto>> update(@PathVariable Long labelId, @Valid @RequestBody LabelRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Label updated", labelService.update(labelId, request, userId)));
    }

    @DeleteMapping("/labels/{labelId}")
    @Operation(summary = "Delete label")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long labelId) {
        Long userId = SecurityUtils.getCurrentUserId();
        labelService.delete(labelId, userId);
        return ResponseEntity.ok(ApiResponse.success("Label deleted", null));
    }
}
