package com.cirquetask.model.dto;

import com.cirquetask.model.enums.DependencyType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDependencyRequest {

    @NotNull(message = "Target task ID is required")
    private Long targetTaskId;

    @NotNull(message = "Dependency type is required")
    private DependencyType dependencyType;
}
