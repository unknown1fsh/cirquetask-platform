package com.cirquetask.controller;

import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.GanttTaskDto;
import com.cirquetask.model.entity.Sprint;
import com.cirquetask.model.enums.Feature;
import com.cirquetask.repository.SprintRepository;
import com.cirquetask.service.GanttService;
import com.cirquetask.service.PlanLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Gantt/Timeline", description = "Gantt chart data endpoints")
public class GanttController {

    private final GanttService ganttService;
    private final PlanLimitService planLimitService;
    private final SprintRepository sprintRepository;

    @GetMapping("/projects/{projectId}/gantt")
    @Operation(summary = "Get Gantt chart data for a project")
    public ResponseEntity<ApiResponse<List<GanttTaskDto>>> getProjectGantt(@PathVariable Long projectId) {
        planLimitService.requireProjectFeature(projectId, Feature.GANTT);
        List<GanttTaskDto> data = ganttService.getProjectGanttData(projectId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/sprints/{sprintId}/gantt")
    @Operation(summary = "Get Gantt chart data for a sprint")
    public ResponseEntity<ApiResponse<List<GanttTaskDto>>> getSprintGantt(@PathVariable Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));
        planLimitService.requireProjectFeature(sprint.getProject().getId(), Feature.GANTT);
        List<GanttTaskDto> data = ganttService.getSprintGanttData(sprintId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
