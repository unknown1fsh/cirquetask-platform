package com.cirquetask.scheduler;

import com.cirquetask.model.entity.RecurringTask;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.enums.RecurrencePattern;
import com.cirquetask.repository.RecurringTaskRepository;
import com.cirquetask.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringTaskScheduler {

    private final RecurringTaskRepository recurringTaskRepository;
    private final TaskRepository taskRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void createRecurringTasks() {
        log.info("Starting recurring task creation job");

        LocalDate today = LocalDate.now();
        List<RecurringTask> dueRecurringTasks = recurringTaskRepository.findDueRecurringTasks(today);

        for (RecurringTask recurring : dueRecurringTasks) {
            try {
                createTaskFromRecurring(recurring);
                updateNextOccurrence(recurring);
                recurringTaskRepository.save(recurring);
            } catch (Exception e) {
                log.error("Failed to create recurring task for {}: {}", recurring.getId(), e.getMessage());
            }
        }

        log.info("Recurring task creation job completed. Created {} tasks", dueRecurringTasks.size());
    }

    private void createTaskFromRecurring(RecurringTask recurring) {
        Integer maxNumber = taskRepository.findMaxTaskNumberByProjectId(recurring.getProject().getId());
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        String taskKey = recurring.getProject().getPrefix() + "-" + nextNumber;

        Task task = Task.builder()
                .title(recurring.getTitle())
                .description(recurring.getDescription())
                .taskKey(taskKey)
                .priority(recurring.getPriority())
                .type(recurring.getType())
                .storyPoints(recurring.getStoryPoints())
                .project(recurring.getProject())
                .column(recurring.getColumn())
                .reporter(recurring.getCreatedBy())
                .dueDate(recurring.getNextOccurrence().plusDays(getDueDays(recurring.getRecurrencePattern())))
                .build();

        taskRepository.save(task);
        log.info("Created recurring task: {}", taskKey);
    }

    private void updateNextOccurrence(RecurringTask recurring) {
        LocalDate next = recurring.getNextOccurrence();

        switch (recurring.getRecurrencePattern()) {
            case DAILY -> next = next.plusDays(1);
            case WEEKLY -> next = next.plusWeeks(1);
            case BIWEEKLY -> next = next.plusWeeks(2);
            case MONTHLY -> next = next.plusMonths(1);
            case QUARTERLY -> next = next.plusMonths(3);
            case YEARLY -> next = next.plusYears(1);
        }

        if (recurring.getEndDate() != null && next.isAfter(recurring.getEndDate())) {
            recurring.setIsActive(false);
        } else {
            recurring.setNextOccurrence(next);
        }
    }

    private int getDueDays(RecurrencePattern pattern) {
        return switch (pattern) {
            case DAILY -> 1;
            case WEEKLY -> 7;
            case BIWEEKLY -> 14;
            case MONTHLY -> 30;
            case QUARTERLY -> 90;
            case YEARLY -> 365;
        };
    }
}
