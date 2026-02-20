package com.cirquetask.model.dto;

import com.cirquetask.model.enums.SprintStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintDto {

    private Long id;
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private Long projectId;
    private Integer completedPoints;
    private Integer totalPoints;
    private Integer taskCount;
    private Integer completedTaskCount;
    private Double progress;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
