package com.cirquetask.service.impl;

import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.NotificationDto;
import com.cirquetask.model.entity.Notification;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.enums.NotificationType;
import com.cirquetask.model.mapper.NotificationMapper;
import com.cirquetask.repository.NotificationRepository;
import com.cirquetask.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void sendTaskAssigned(Task task, User assignee, User sender) {
        Notification notification = Notification.builder()
                .title("Task Assigned")
                .message(sender.getFullName() + " assigned you to task: " + task.getTaskKey() + " - " + task.getTitle())
                .type(NotificationType.TASK_ASSIGNED)
                .recipient(assignee)
                .sender(sender)
                .project(task.getProject())
                .task(task)
                .build();

        notification = notificationRepository.save(notification);
        pushNotification(assignee.getId(), notificationMapper.toDto(notification));
    }

    @Override
    @Transactional
    public void sendCommentAdded(Task task, User commenter) {
        // Notify reporter and assignees (except commenter)
        if (!task.getReporter().getId().equals(commenter.getId())) {
            Notification notification = Notification.builder()
                    .title("New Comment")
                    .message(commenter.getFullName() + " commented on " + task.getTaskKey() + ": " + task.getTitle())
                    .type(NotificationType.COMMENT_ADDED)
                    .recipient(task.getReporter())
                    .sender(commenter)
                    .project(task.getProject())
                    .task(task)
                    .build();
            notification = notificationRepository.save(notification);
            pushNotification(task.getReporter().getId(), notificationMapper.toDto(notification));
        }

        task.getAssignees().stream()
                .filter(a -> !a.getId().equals(commenter.getId()))
                .forEach(assignee -> {
                    Notification notif = Notification.builder()
                            .title("New Comment")
                            .message(commenter.getFullName() + " commented on " + task.getTaskKey() + ": " + task.getTitle())
                            .type(NotificationType.COMMENT_ADDED)
                            .recipient(assignee)
                            .sender(commenter)
                            .project(task.getProject())
                            .task(task)
                            .build();
                    notif = notificationRepository.save(notif);
                    pushNotification(assignee.getId(), notificationMapper.toDto(notif));
                });
    }

    @Override
    @Transactional
    public void sendMemberAdded(Long projectId, User newMember, User sender) {
        Notification notification = Notification.builder()
                .title("Added to Project")
                .message(sender.getFullName() + " added you to a project")
                .type(NotificationType.MEMBER_ADDED)
                .recipient(newMember)
                .sender(sender)
                .build();
        notification = notificationRepository.save(notification);
        pushNotification(newMember.getId(), notificationMapper.toDto(notification));
    }

    @Override
    @Transactional
    public void sendMention(Task task, User mentionedUser, User sender, String context) {
        if (mentionedUser.getId().equals(sender.getId())) {
            return;
        }

        Notification notification = Notification.builder()
                .title("You were mentioned")
                .message(sender.getFullName() + " mentioned you in " + task.getTaskKey() + ": " + context)
                .type(NotificationType.MENTION)
                .recipient(mentionedUser)
                .sender(sender)
                .project(task.getProject())
                .task(task)
                .build();

        notification = notificationRepository.save(notification);
        pushNotification(mentionedUser.getId(), notificationMapper.toDto(notification));
        log.info("Mention notification sent to user {} for task {}", mentionedUser.getId(), task.getTaskKey());
    }

    @Override
    @Transactional
    public void sendDeadlineReminder(Task task, User user, int daysUntilDue) {
        String message = daysUntilDue == 0 
                ? "Task " + task.getTaskKey() + " is due today!"
                : "Task " + task.getTaskKey() + " is due in " + daysUntilDue + " day(s)";

        Notification notification = Notification.builder()
                .title("Deadline Approaching")
                .message(message)
                .type(NotificationType.DEADLINE_APPROACHING)
                .recipient(user)
                .project(task.getProject())
                .task(task)
                .build();

        notification = notificationRepository.save(notification);
        pushNotification(user.getId(), notificationMapper.toDto(notification));
        log.info("Deadline reminder sent to user {} for task {}", user.getId(), task.getTaskKey());
    }

    @Override
    @Transactional
    public void sendTaskUpdated(Task task, User recipient, String updateDescription) {
        Notification notification = Notification.builder()
                .title("Task Updated")
                .message(updateDescription + " - " + task.getTaskKey() + ": " + task.getTitle())
                .type(NotificationType.TASK_UPDATED)
                .recipient(recipient)
                .project(task.getProject())
                .task(task)
                .build();

        notification = notificationRepository.save(notification);
        pushNotification(recipient.getId(), notificationMapper.toDto(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId, int page, int size) {
        return notificationMapper.toDtoList(
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size)).getContent()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    private void pushNotification(Long userId, NotificationDto dto) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, dto);
        } catch (Exception e) {
            log.warn("Failed to push notification to user {}: {}", userId, e.getMessage());
        }
    }
}
