package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.BulkUpdateRequest;
import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.BulkOperationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bulk")
@RequiredArgsConstructor
@Tag(name = "Bulk Operations", description = "Bulk task operation endpoints")
public class BulkOperationController {

    private final BulkOperationService bulkOperationService;

    @PostMapping("/tasks/update")
    @Operation(summary = "Bulk update tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> bulkUpdateTasks(@RequestBody BulkUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<TaskDto> tasks = bulkOperationService.bulkUpdateTasks(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Tasks updated", tasks));
    }

    @PostMapping("/tasks/delete")
    @Operation(summary = "Bulk delete tasks")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<Void>> bulkDeleteTasks(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Number> taskIdList = (List<Number>) body.get("taskIds");
        Set<Long> taskIds = taskIdList.stream().map(Number::longValue).collect(Collectors.toSet());
        bulkOperationService.bulkDeleteTasks(taskIds, userId);
        return ResponseEntity.ok(ApiResponse.success("Tasks deleted", null));
    }

    @PostMapping("/tasks/move-to-sprint")
    @Operation(summary = "Bulk move tasks to sprint")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<List<TaskDto>>> bulkMoveToSprint(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Number> taskIdList = (List<Number>) body.get("taskIds");
        Set<Long> taskIds = taskIdList.stream().map(Number::longValue).collect(Collectors.toSet());
        Long sprintId = ((Number) body.get("sprintId")).longValue();
        List<TaskDto> tasks = bulkOperationService.bulkMoveToSprint(taskIds, sprintId, userId);
        return ResponseEntity.ok(ApiResponse.success("Tasks moved to sprint", tasks));
    }

    @PostMapping("/tasks/move-to-column")
    @Operation(summary = "Bulk move tasks to column")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<List<TaskDto>>> bulkMoveToColumn(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Number> taskIdList = (List<Number>) body.get("taskIds");
        Set<Long> taskIds = taskIdList.stream().map(Number::longValue).collect(Collectors.toSet());
        Long columnId = ((Number) body.get("columnId")).longValue();
        List<TaskDto> tasks = bulkOperationService.bulkMoveToColumn(taskIds, columnId, userId);
        return ResponseEntity.ok(ApiResponse.success("Tasks moved to column", tasks));
    }
}
