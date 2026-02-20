package com.cirquetask.model.dto;

import com.cirquetask.model.enums.TaskStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GanttTaskDto {

    private Long id;
    private String taskKey;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate dueDate;
    private TaskStatus status;
    private Double progress;
    private Long parentTaskId;
    private List<Long> dependencies;
    private List<UserDto> assignees;
    private String color;
}
