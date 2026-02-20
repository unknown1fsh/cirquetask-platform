package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.SprintMetricsDto;
import com.cirquetask.model.dto.VelocityDataPoint;
import com.cirquetask.service.SprintMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Sprint Metrics", description = "Sprint burndown and velocity endpoints")
public class SprintMetricsController {

    private final SprintMetricsService sprintMetricsService;

    @GetMapping("/sprints/{sprintId}/burndown")
    @Operation(summary = "Get sprint burndown chart data")
    public ResponseEntity<ApiResponse<SprintMetricsDto>> getSprintBurndown(@PathVariable Long sprintId) {
        SprintMetricsDto metrics = sprintMetricsService.getSprintBurndown(sprintId);
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/projects/{projectId}/velocity")
    @Operation(summary = "Get project velocity chart data")
    public ResponseEntity<ApiResponse<List<VelocityDataPoint>>> getProjectVelocity(
            @PathVariable Long projectId,
            @RequestParam(name = "sprintCount", defaultValue = "6") int sprintCount) {
        List<VelocityDataPoint> velocity = sprintMetricsService.getProjectVelocity(projectId, sprintCount);
        return ResponseEntity.ok(ApiResponse.success(velocity));
    }

    @GetMapping("/projects/{projectId}/velocity/average")
    @Operation(summary = "Get project average velocity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAverageVelocity(
            @PathVariable Long projectId,
            @RequestParam(name = "sprintCount", defaultValue = "6") int sprintCount) {
        Double avgVelocity = sprintMetricsService.getAverageVelocity(projectId, sprintCount);
        Map<String, Object> result = Map.of(
                "averageVelocity", avgVelocity,
                "sprintCount", sprintCount
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
