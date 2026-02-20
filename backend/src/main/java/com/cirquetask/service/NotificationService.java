package com.cirquetask.service;

import com.cirquetask.model.dto.NotificationDto;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;

import java.util.List;

public interface NotificationService {

    void sendTaskAssigned(Task task, User assignee, User sender);

    void sendCommentAdded(Task task, User commenter);

    void sendMemberAdded(Long projectId, User newMember, User sender);

    void sendMention(Task task, User mentionedUser, User sender, String context);

    void sendDeadlineReminder(Task task, User user, int daysUntilDue);

    void sendTaskUpdated(Task task, User recipient, String updateDescription);

    List<NotificationDto> getUserNotifications(Long userId, int page, int size);

    Long getUnreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);
}
