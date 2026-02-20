package com.cirquetask.model.dto;

import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.model.enums.TaskType;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRequest {

    private String query;
    private Set<Long> projectIds;
    private Set<Long> assigneeIds;
    private Set<Long> labelIds;
    private Set<TaskStatus> statuses;
    private Set<TaskPriority> priorities;
    private Set<TaskType> types;
    private LocalDate dueDateFrom;
    private LocalDate dueDateTo;
    private LocalDate createdFrom;
    private LocalDate createdTo;
    private Boolean includeArchived;
}
