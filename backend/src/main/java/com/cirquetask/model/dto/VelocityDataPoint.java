package com.cirquetask.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VelocityDataPoint {

    private Long sprintId;
    private String sprintName;
    private Integer plannedPoints;
    private Integer completedPoints;
}
