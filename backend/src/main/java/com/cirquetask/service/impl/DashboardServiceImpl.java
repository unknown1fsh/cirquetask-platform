package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.model.dto.ActivityLogDto;
import com.cirquetask.model.dto.DashboardDto;
import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.model.mapper.ActivityLogMapper;
import com.cirquetask.model.mapper.TaskMapper;
import com.cirquetask.repository.*;
import com.cirquetask.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskMapper taskMapper;
    private final ActivityLogMapper activityLogMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardDto getUserDashboard(Long userId) {
        List<Project> userProjects = projectRepository.findByMemberUserId(userId);

        long totalTasks = 0;
        long completedTasks = 0;
        long overdueTasks = 0;
        long inProgressTasks = 0;

        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        Map<String, Long> tasksByPriority = new LinkedHashMap<>();

        for (TaskStatus status : TaskStatus.values()) tasksByStatus.put(status.name(), 0L);
        for (TaskPriority priority : TaskPriority.values()) tasksByPriority.put(priority.name(), 0L);

        for (Project project : userProjects) {
            Long projectId = project.getId();
            totalTasks += projectRepository.countTasksByProjectId(projectId);

            for (TaskStatus status : TaskStatus.values()) {
                Long count = taskRepository.countByProjectIdAndStatus(projectId, status);
                tasksByStatus.merge(status.name(), count, Long::sum);
                if (status == TaskStatus.DONE) completedTasks += count;
                if (status == TaskStatus.IN_PROGRESS) inProgressTasks += count;
            }

            for (TaskPriority priority : TaskPriority.values()) {
                Long count = taskRepository.countByProjectIdAndPriority(projectId, priority);
                tasksByPriority.merge(priority.name(), count, Long::sum);
            }

            overdueTasks += taskRepository.countOverdueByProjectId(projectId);
        }

        List<TaskDto> myTasks = taskMapper.toDtoList(taskRepository.findActiveTasksByAssigneeId(userId));
        List<ActivityLogDto> recentActivities = activityLogMapper.toDtoList(
                activityLogRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId));

        return DashboardDto.builder()
                .totalProjects((long) userProjects.size())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .inProgressTasks(inProgressTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .recentActivities(recentActivities)
                .myTasks(myTasks)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardDto getProjectDashboard(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new AccessDeniedException("You are not a member of this project");
        }

        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        Map<String, Long> tasksByPriority = new LinkedHashMap<>();

        long totalTasks = projectRepository.countTasksByProjectId(projectId);
        long completedTasks = 0;
        long inProgressTasks = 0;

        for (TaskStatus status : TaskStatus.values()) {
            Long count = taskRepository.countByProjectIdAndStatus(projectId, status);
            tasksByStatus.put(status.name(), count);
            if (status == TaskStatus.DONE) completedTasks = count;
            if (status == TaskStatus.IN_PROGRESS) inProgressTasks = count;
        }

        for (TaskPriority priority : TaskPriority.values()) {
            Long count = taskRepository.countByProjectIdAndPriority(projectId, priority);
            tasksByPriority.put(priority.name(), count);
        }

        Long overdueTasks = taskRepository.countOverdueByProjectId(projectId);

        List<TaskDto> upcomingDeadlines = taskMapper.toDtoList(
                taskRepository.findUpcomingDeadlines(projectId, LocalDate.now().plusDays(7)));

        List<ActivityLogDto> recentActivities = activityLogMapper.toDtoList(
                activityLogRepository.findTop20ByProjectIdOrderByCreatedAtDesc(projectId));

        return DashboardDto.builder()
                .totalProjects(1L)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .inProgressTasks(inProgressTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .recentActivities(recentActivities)
                .upcomingDeadlines(upcomingDeadlines)
                .build();
    }
}
