package com.cirquetask.model.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardDto {
    private Long totalProjects;
    private Long totalTasks;
    private Long completedTasks;
    private Long overdueTasks;
    private Long inProgressTasks;
    private Map<String, Long> tasksByStatus;
    private Map<String, Long> tasksByPriority;
    private List<ActivityLogDto> recentActivities;
    private List<TaskDto> upcomingDeadlines;
    private List<TaskDto> myTasks;
}
