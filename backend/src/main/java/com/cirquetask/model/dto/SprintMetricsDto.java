package com.cirquetask.model.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintMetricsDto {

    private Long sprintId;
    private String sprintName;
    private Integer totalPoints;
    private Integer completedPoints;
    private Integer remainingPoints;
    private Double completionPercentage;
    private List<BurndownDataPoint> burndownData;
}
