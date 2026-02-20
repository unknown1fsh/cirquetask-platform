package com.cirquetask.model.dto;

import com.cirquetask.model.enums.WorkflowAction;
import com.cirquetask.model.enums.WorkflowTrigger;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowRuleRequest {

    @NotBlank(message = "Rule name is required")
    private String name;

    private String description;

    @NotNull(message = "Trigger is required")
    private WorkflowTrigger trigger;

    private String triggerValue;

    @NotNull(message = "Action is required")
    private WorkflowAction action;

    private String actionValue;

    private Boolean isActive;
}
