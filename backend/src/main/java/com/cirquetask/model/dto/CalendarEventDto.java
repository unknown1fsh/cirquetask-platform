package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventDto {

    private Long id;
    private String taskKey;
    private String title;
    private LocalDate date;
    private String type;
    private String priority;
    private String status;
    private Long projectId;
    private String projectName;
    private String color;
}
