package com.cirquetask.service.impl;

import com.cirquetask.model.entity.Sprint;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.TimeLog;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.repository.SprintRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.repository.TimeLogRepository;
import com.cirquetask.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final TimeLogRepository timeLogRepository;

    @Override
    @Transactional(readOnly = true)
    public byte[] generateProjectReport(Long projectId, LocalDate startDate, LocalDate endDate, String format) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        StringBuilder csv = new StringBuilder();
        csv.append("Task Key,Title,Status,Priority,Type,Story Points,Assignees,Due Date,Created At\n");

        for (Task task : tasks) {
            String assignees = task.getAssignees().stream()
                    .map(u -> u.getFullName())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("");

            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\"\n",
                    task.getTaskKey(),
                    task.getTitle().replace("\"", "\"\""),
                    task.getStatus(),
                    task.getPriority(),
                    task.getType(),
                    task.getStoryPoints() != null ? task.getStoryPoints() : 0,
                    assignees,
                    task.getDueDate() != null ? task.getDueDate().toString() : "",
                    task.getCreatedAt() != null ? task.getCreatedAt().toString() : ""));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateSprintReport(Long sprintId, String format) {
        Sprint sprint = sprintRepository.findById(sprintId).orElse(null);
        if (sprint == null) {
            return new byte[0];
        }

        List<Task> tasks = taskRepository.findBySprintId(sprintId);

        int totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        int totalPoints = tasks.stream().mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
        int completedPoints = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        StringBuilder csv = new StringBuilder();
        csv.append("Sprint Report\n\n");
        csv.append("Sprint Name,").append(sprint.getName()).append("\n");
        csv.append("Status,").append(sprint.getStatus()).append("\n");
        csv.append("Start Date,").append(sprint.getStartDate()).append("\n");
        csv.append("End Date,").append(sprint.getEndDate()).append("\n");
        csv.append("Total Tasks,").append(totalTasks).append("\n");
        csv.append("Completed Tasks,").append(completedTasks).append("\n");
        csv.append("Total Points,").append(totalPoints).append("\n");
        csv.append("Completed Points,").append(completedPoints).append("\n\n");

        csv.append("Task Key,Title,Status,Story Points,Assignees\n");
        for (Task task : tasks) {
            String assignees = task.getAssignees().stream()
                    .map(u -> u.getFullName())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("");

            csv.append(String.format("\"%s\",\"%s\",\"%s\",%d,\"%s\"\n",
                    task.getTaskKey(),
                    task.getTitle().replace("\"", "\"\""),
                    task.getStatus(),
                    task.getStoryPoints() != null ? task.getStoryPoints() : 0,
                    assignees));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateUserTimesheetReport(Long userId, LocalDate startDate, LocalDate endDate, String format) {
        List<TimeLog> timeLogs = timeLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        int totalMinutes = timeLogs.stream().mapToInt(TimeLog::getDurationMinutes).sum();

        StringBuilder csv = new StringBuilder();
        csv.append("Timesheet Report\n\n");
        csv.append("Period,").append(startDate).append(" to ").append(endDate).append("\n");
        csv.append("Total Hours,").append(String.format("%.2f", totalMinutes / 60.0)).append("\n\n");

        csv.append("Date,Task Key,Task Title,Duration (hours),Description\n");
        for (TimeLog log : timeLogs) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",%.2f,\"%s\"\n",
                    log.getLoggedDate(),
                    log.getTask().getTaskKey(),
                    log.getTask().getTitle().replace("\"", "\"\""),
                    log.getDurationMinutes() / 60.0,
                    log.getDescription() != null ? log.getDescription().replace("\"", "\"\"") : ""));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
