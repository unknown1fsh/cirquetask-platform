package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BurndownDataPoint {

    private LocalDate date;
    private Integer remainingPoints;
    private Integer completedPoints;
    private Integer idealPoints;
}
