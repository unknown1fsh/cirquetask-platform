package com.cirquetask.model.dto;

import com.cirquetask.model.enums.WorkflowAction;
import com.cirquetask.model.enums.WorkflowTrigger;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowRuleDto {

    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private WorkflowTrigger trigger;
    private String triggerValue;
    private WorkflowAction action;
    private String actionValue;
    private Boolean isActive;
    private UserDto createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
