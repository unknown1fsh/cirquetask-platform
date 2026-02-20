package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.CalendarEventDto;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.CalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "Calendar view endpoints")
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/calendar/my")
    @Operation(summary = "Get current user's calendar events")
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getMyCalendarEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<CalendarEventDto> events = calendarService.getUserCalendarEvents(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/projects/{projectId}/calendar")
    @Operation(summary = "Get project calendar events")
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getProjectCalendarEvents(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<CalendarEventDto> events = calendarService.getProjectCalendarEvents(projectId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(events));
    }
}
