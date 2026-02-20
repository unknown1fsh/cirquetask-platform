package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.SearchRequest;
import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Advanced search endpoints")
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/tasks")
    @Operation(summary = "Search tasks with filters")
    public ResponseEntity<ApiResponse<Page<TaskDto>>> searchTasks(
            @RequestBody SearchRequest request,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<TaskDto> results = searchService.searchTasks(request, userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
