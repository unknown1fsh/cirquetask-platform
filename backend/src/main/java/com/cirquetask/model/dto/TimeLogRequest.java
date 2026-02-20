package com.cirquetask.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeLogRequest {

    @NotNull(message = "Task ID is required")
    private Long taskId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private String description;

    private LocalDate loggedDate;
}
