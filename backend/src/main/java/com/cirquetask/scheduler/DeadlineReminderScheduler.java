package com.cirquetask.scheduler;

import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.enums.NotificationType;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.service.EmailService;
import com.cirquetask.service.NotificationService;
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
public class DeadlineReminderScheduler {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void sendDeadlineReminders() {
        log.info("Starting deadline reminder job");

        LocalDate today = LocalDate.now();
        LocalDate threeDaysFromNow = today.plusDays(3);

        List<Task> upcomingTasks = taskRepository.findTasksWithUpcomingDeadlines(today, threeDaysFromNow);

        for (Task task : upcomingTasks) {
            int daysUntilDue = (int) java.time.temporal.ChronoUnit.DAYS.between(today, task.getDueDate());

            for (User assignee : task.getAssignees()) {
                sendDeadlineNotification(task, assignee, daysUntilDue);
            }

            if (task.getAssignees().isEmpty() && task.getReporter() != null) {
                sendDeadlineNotification(task, task.getReporter(), daysUntilDue);
            }
        }

        log.info("Deadline reminder job completed. Processed {} tasks", upcomingTasks.size());
    }

    private void sendDeadlineNotification(Task task, User user, int daysUntilDue) {
        try {
            notificationService.sendDeadlineReminder(task, user, daysUntilDue);
            emailService.sendDeadlineReminderEmail(task, user, daysUntilDue);
            log.debug("Sent deadline reminder to {} for task {}", user.getEmail(), task.getTaskKey());
        } catch (Exception e) {
            log.error("Failed to send deadline reminder to {} for task {}: {}", 
                    user.getEmail(), task.getTaskKey(), e.getMessage());
        }
    }
}
