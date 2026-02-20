package com.cirquetask.controller;

import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Report generation endpoints")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Generate project report")
    public ResponseEntity<byte[]> generateProjectReport(
            @PathVariable Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "csv") String format) {
        byte[] report = reportService.generateProjectReport(projectId, startDate, endDate, format);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=project-report." + format)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(report);
    }

    @GetMapping("/sprints/{sprintId}")
    @Operation(summary = "Generate sprint report")
    public ResponseEntity<byte[]> generateSprintReport(
            @PathVariable Long sprintId,
            @RequestParam(defaultValue = "csv") String format) {
        byte[] report = reportService.generateSprintReport(sprintId, format);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sprint-report." + format)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(report);
    }

    @GetMapping("/timesheet/my")
    @Operation(summary = "Generate user timesheet report")
    public ResponseEntity<byte[]> generateMyTimesheetReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "csv") String format) {
        Long userId = SecurityUtils.getCurrentUserId();
        byte[] report = reportService.generateUserTimesheetReport(userId, startDate, endDate, format);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=timesheet-report." + format)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(report);
    }
}
