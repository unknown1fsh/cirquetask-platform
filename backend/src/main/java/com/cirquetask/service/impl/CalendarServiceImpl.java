package com.cirquetask.service.impl;

import com.cirquetask.model.dto.CalendarEventDto;
import com.cirquetask.model.entity.Task;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarServiceImpl implements CalendarService {

    private final TaskRepository taskRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CalendarEventDto> getUserCalendarEvents(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Task> tasks = taskRepository.findUserTasksWithDueDateInRange(userId, startDate, endDate);
        return tasks.stream().map(this::toCalendarEvent).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarEventDto> getProjectCalendarEvents(Long projectId, LocalDate startDate, LocalDate endDate) {
        List<Task> tasks = taskRepository.findProjectTasksWithDueDateInRange(projectId, startDate, endDate);
        return tasks.stream().map(this::toCalendarEvent).toList();
    }

    private CalendarEventDto toCalendarEvent(Task task) {
        return CalendarEventDto.builder()
                .id(task.getId())
                .taskKey(task.getTaskKey())
                .title(task.getTitle())
                .date(task.getDueDate())
                .type(task.getType().name())
                .priority(task.getPriority().name())
                .status(task.getStatus().name())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .color(getPriorityColor(task.getPriority().name()))
                .build();
    }

    private String getPriorityColor(String priority) {
        return switch (priority) {
            case "CRITICAL" -> "#dc2626";
            case "HIGH" -> "#f59e0b";
            case "MEDIUM" -> "#3b82f6";
            case "LOW" -> "#22c55e";
            default -> "#94a3b8";
        };
    }
}
