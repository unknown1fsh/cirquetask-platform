package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.GanttTaskDto;
import com.cirquetask.service.GanttService;
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

    @GetMapping("/projects/{projectId}/gantt")
    @Operation(summary = "Get Gantt chart data for a project")
    public ResponseEntity<ApiResponse<List<GanttTaskDto>>> getProjectGantt(@PathVariable Long projectId) {
        List<GanttTaskDto> data = ganttService.getProjectGanttData(projectId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/sprints/{sprintId}/gantt")
    @Operation(summary = "Get Gantt chart data for a sprint")
    public ResponseEntity<ApiResponse<List<GanttTaskDto>>> getSprintGantt(@PathVariable Long sprintId) {
        List<GanttTaskDto> data = ganttService.getSprintGanttData(sprintId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
