package com.cirquetask.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintRequest {

    @NotBlank(message = "Sprint name is required")
    @Size(max = 255, message = "Sprint name must be less than 255 characters")
    private String name;

    @Size(max = 1000, message = "Goal must be less than 1000 characters")
    private String goal;

    private LocalDate startDate;

    private LocalDate endDate;
}
