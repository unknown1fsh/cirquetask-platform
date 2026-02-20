package com.cirquetask.model.dto;

import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(max = 500)
    private String title;

    private String description;
    private TaskPriority priority;
    private TaskType type;
    private Integer storyPoints;
    private Long columnId;
    private Set<Long> assigneeIds;
    private Set<Long> labelIds;
    private Long parentTaskId;
    private LocalDate dueDate;
}
