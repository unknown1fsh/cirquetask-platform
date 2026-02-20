package com.cirquetask.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TaskMoveRequest {

    @NotNull(message = "Target column ID is required")
    private Long columnId;

    @NotNull(message = "Position is required")
    private Integer position;
}
