package com.cirquetask.service;

import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;

public interface EmailService {

    void sendTaskAssignedEmail(Task task, User assignee, User assigner);

    void sendCommentNotificationEmail(Task task, User recipient, User commenter, String commentPreview);

    void sendMentionEmail(Task task, User mentionedUser, User sender, String context);

    void sendDeadlineReminderEmail(Task task, User assignee, int daysUntilDue);

    void sendPasswordResetEmail(User user, String resetToken);

    void sendWelcomeEmail(User user);
}
