package com.cirquetask.model.dto;

import com.cirquetask.model.enums.Feature;
import com.cirquetask.model.enums.Plan;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanDto {
    private Plan plan;
    private String subscriptionStatus;
    private LocalDateTime currentPeriodEnd;
    private int maxProjects;
    private int maxMembersPerProject;
    private long currentProjectCount;
    private int currentMembersInProject; // optional, for a specific project context
    private List<Feature> enabledFeatures;
}
