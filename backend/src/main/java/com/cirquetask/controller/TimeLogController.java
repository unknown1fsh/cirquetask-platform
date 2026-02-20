package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.TimeLogDto;
import com.cirquetask.model.dto.TimeLogRequest;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.model.enums.Feature;
import com.cirquetask.service.PlanLimitService;
import com.cirquetask.service.TimeLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Time Tracking", description = "Time logging endpoints")
public class TimeLogController {

    private final TimeLogService timeLogService;
    private final PlanLimitService planLimitService;

    @PostMapping("/time-logs")
    @Operation(summary = "Log time for a task")
    public ResponseEntity<ApiResponse<TimeLogDto>> logTime(@Valid @RequestBody TimeLogRequest request) {
        planLimitService.requireTaskProjectFeature(request.getTaskId(), Feature.TIME_LOG);
        Long userId = SecurityUtils.getCurrentUserId();
        TimeLogDto timeLog = timeLogService.logTime(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Time logged", timeLog));
    }

    @GetMapping("/time-logs/{timeLogId}")
    @Operation(summary = "Get time log by ID")
    public ResponseEntity<ApiResponse<TimeLogDto>> getTimeLog(@PathVariable Long timeLogId) {
        planLimitService.requireTimeLogProjectFeature(timeLogId, Feature.TIME_LOG);
        TimeLogDto timeLog = timeLogService.getTimeLogById(timeLogId);
        return ResponseEntity.ok(ApiResponse.success(timeLog));
    }

    @GetMapping("/tasks/{taskId}/time-logs")
    @Operation(summary = "Get time logs for a task")
    public ResponseEntity<ApiResponse<List<TimeLogDto>>> getTaskTimeLogs(@PathVariable Long taskId) {
        planLimitService.requireTaskProjectFeature(taskId, Feature.TIME_LOG);
        List<TimeLogDto> timeLogs = timeLogService.getTimeLogsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(timeLogs));
    }

    @GetMapping("/tasks/{taskId}/time-logs/total")
    @Operation(summary = "Get total logged time for a task")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTaskTotalTime(@PathVariable Long taskId) {
        planLimitService.requireTaskProjectFeature(taskId, Feature.TIME_LOG);
        Integer totalMinutes = timeLogService.getTotalMinutesByTask(taskId);
        Map<String, Object> result = Map.of(
                "totalMinutes", totalMinutes,
                "totalHours", Math.round(totalMinutes / 60.0 * 100.0) / 100.0
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/users/me/time-logs")
    @Operation(summary = "Get current user's time logs")
    public ResponseEntity<ApiResponse<List<TimeLogDto>>> getMyTimeLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getCurrentUserId();
        planLimitService.requireUserFeature(userId, Feature.TIME_LOG);
        List<TimeLogDto> timeLogs;

        if (startDate != null && endDate != null) {
            timeLogs = timeLogService.getTimeLogsByUserAndDateRange(userId, startDate, endDate);
        } else {
            timeLogs = timeLogService.getTimeLogsByUser(userId);
        }

        return ResponseEntity.ok(ApiResponse.success(timeLogs));
    }

    @GetMapping("/users/me/time-logs/total")
    @Operation(summary = "Get current user's total logged time for a date range")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyTotalTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getCurrentUserId();
        planLimitService.requireUserFeature(userId, Feature.TIME_LOG);
        Integer totalMinutes = timeLogService.getTotalMinutesByUserAndDateRange(userId, startDate, endDate);
        Map<String, Object> result = Map.of(
                "totalMinutes", totalMinutes,
                "totalHours", Math.round(totalMinutes / 60.0 * 100.0) / 100.0
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/projects/{projectId}/time-logs")
    @Operation(summary = "Get time logs for a project")
    public ResponseEntity<ApiResponse<List<TimeLogDto>>> getProjectTimeLogs(
            @PathVariable Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        planLimitService.requireProjectFeature(projectId, Feature.TIME_LOG);
        List<TimeLogDto> timeLogs;

        if (startDate != null && endDate != null) {
            timeLogs = timeLogService.getTimeLogsByProjectAndDateRange(projectId, startDate, endDate);
        } else {
            timeLogs = timeLogService.getTimeLogsByProject(projectId);
        }

        return ResponseEntity.ok(ApiResponse.success(timeLogs));
    }

    @PutMapping("/time-logs/{timeLogId}")
    @Operation(summary = "Update a time log")
    public ResponseEntity<ApiResponse<TimeLogDto>> updateTimeLog(
            @PathVariable Long timeLogId,
            @Valid @RequestBody TimeLogRequest request) {
        planLimitService.requireTimeLogProjectFeature(timeLogId, Feature.TIME_LOG);
        Long userId = SecurityUtils.getCurrentUserId();
        TimeLogDto timeLog = timeLogService.updateTimeLog(timeLogId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Time log updated", timeLog));
    }

    @DeleteMapping("/time-logs/{timeLogId}")
    @Operation(summary = "Delete a time log")
    public ResponseEntity<ApiResponse<Void>> deleteTimeLog(@PathVariable Long timeLogId) {
        planLimitService.requireTimeLogProjectFeature(timeLogId, Feature.TIME_LOG);
        Long userId = SecurityUtils.getCurrentUserId();
        timeLogService.deleteTimeLog(timeLogId, userId);
        return ResponseEntity.ok(ApiResponse.success("Time log deleted", null));
    }
}
