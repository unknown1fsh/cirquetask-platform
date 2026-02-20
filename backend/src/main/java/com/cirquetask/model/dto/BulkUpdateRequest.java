package com.cirquetask.model.dto;

import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskStatus;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUpdateRequest {

    private Set<Long> taskIds;
    private TaskStatus status;
    private TaskPriority priority;
    private Set<Long> assigneeIds;
    private Set<Long> labelIds;
    private Long sprintId;
    private Long columnId;
}
