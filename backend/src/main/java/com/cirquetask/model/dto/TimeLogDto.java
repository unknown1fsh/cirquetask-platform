package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeLogDto {

    private Long id;
    private Long taskId;
    private String taskKey;
    private String taskTitle;
    private UserDto user;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String description;
    private LocalDate loggedDate;
    private LocalDateTime createdAt;
}
