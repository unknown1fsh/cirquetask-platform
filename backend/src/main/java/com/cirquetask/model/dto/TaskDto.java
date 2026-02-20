package com.cirquetask.model.dto;

import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.model.enums.TaskType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private String taskKey;
    private TaskPriority priority;
    private TaskStatus status;
    private TaskType type;
    private Integer storyPoints;
    private Long columnId;
    private Integer position;
    private Long projectId;
    private UserDto reporter;
    private Set<UserDto> assignees;
    private Set<LabelDto> labels;
    private Long parentTaskId;
    private Long sprintId;
    private String sprintName;
    private List<TaskDto> subtasks;
    private Integer commentCount;
    private Integer attachmentCount;
    private LocalDate dueDate;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
