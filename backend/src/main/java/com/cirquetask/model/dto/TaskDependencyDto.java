package com.cirquetask.model.dto;

import com.cirquetask.model.enums.DependencyType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDependencyDto {

    private Long id;
    private Long sourceTaskId;
    private String sourceTaskKey;
    private String sourceTaskTitle;
    private Long targetTaskId;
    private String targetTaskKey;
    private String targetTaskTitle;
    private DependencyType dependencyType;
    private UserDto createdBy;
    private LocalDateTime createdAt;
}
