package com.cirquetask.service;

import com.cirquetask.model.dto.BulkUpdateRequest;
import com.cirquetask.model.dto.TaskDto;

import java.util.List;
import java.util.Set;

public interface BulkOperationService {

    List<TaskDto> bulkUpdateTasks(BulkUpdateRequest request, Long userId);

    void bulkDeleteTasks(Set<Long> taskIds, Long userId);

    List<TaskDto> bulkMoveToSprint(Set<Long> taskIds, Long sprintId, Long userId);

    List<TaskDto> bulkMoveToColumn(Set<Long> taskIds, Long columnId, Long userId);
}
