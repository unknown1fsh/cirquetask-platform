package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.AuditLogDto;
import com.cirquetask.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Audit", description = "Audit trail endpoints")
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get audit logs for a task")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getTaskAuditLogs(
            @PathVariable Long taskId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<AuditLogDto> logs = auditService.getEntityAuditLogs("Task", taskId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Get audit logs for a project")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getProjectAuditLogs(
            @PathVariable Long projectId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<AuditLogDto> logs = auditService.getEntityAuditLogs("Project", projectId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
