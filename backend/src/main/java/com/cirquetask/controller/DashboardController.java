package com.cirquetask.controller;

import com.cirquetask.model.dto.ActivityLogDto;
import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.DashboardDto;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.ActivityLogService;
import com.cirquetask.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard and analytics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;
    private final ActivityLogService activityLogService;

    @GetMapping
    @Operation(summary = "Get user dashboard data")
    public ResponseEntity<ApiResponse<DashboardDto>> getUserDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getUserDashboard(userId)));
    }

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Get project-specific dashboard data")
    public ResponseEntity<ApiResponse<DashboardDto>> getProjectDashboard(@PathVariable Long projectId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getProjectDashboard(projectId, userId)));
    }

    @GetMapping("/projects/{projectId}/activities")
    @Operation(summary = "Get project activities")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getProjectActivities(@PathVariable Long projectId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(activityLogService.getProjectActivities(projectId, userId)));
    }

    @GetMapping("/activities")
    @Operation(summary = "Get user's recent activities")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getUserActivities() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(activityLogService.getUserActivities(userId)));
    }
}
