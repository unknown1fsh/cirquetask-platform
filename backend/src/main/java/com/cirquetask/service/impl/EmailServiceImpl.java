package com.cirquetask.service.impl;

import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;
import com.cirquetask.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@cirquetask.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    @Async
    public void sendTaskAssignedEmail(Task task, User assignee, User assigner) {
        Context context = new Context();
        context.setVariable("assigneeName", assignee.getFirstName());
        context.setVariable("assignerName", assigner.getFullName());
        context.setVariable("taskKey", task.getTaskKey());
        context.setVariable("taskTitle", task.getTitle());
        context.setVariable("taskUrl", frontendUrl + "/tasks/" + task.getId());
        context.setVariable("projectName", task.getProject().getName());

        String htmlContent = templateEngine.process("email/task-assigned", context);
        sendHtmlEmail(assignee.getEmail(), "Task Assigned: " + task.getTaskKey(), htmlContent);
    }

    @Override
    @Async
    public void sendCommentNotificationEmail(Task task, User recipient, User commenter, String commentPreview) {
        Context context = new Context();
        context.setVariable("recipientName", recipient.getFirstName());
        context.setVariable("commenterName", commenter.getFullName());
        context.setVariable("taskKey", task.getTaskKey());
        context.setVariable("taskTitle", task.getTitle());
        context.setVariable("commentPreview", commentPreview);
        context.setVariable("taskUrl", frontendUrl + "/tasks/" + task.getId());

        String htmlContent = templateEngine.process("email/comment-notification", context);
        sendHtmlEmail(recipient.getEmail(), "New Comment on " + task.getTaskKey(), htmlContent);
    }

    @Override
    @Async
    public void sendMentionEmail(Task task, User mentionedUser, User sender, String context) {
        Context templateContext = new Context();
        templateContext.setVariable("recipientName", mentionedUser.getFirstName());
        templateContext.setVariable("senderName", sender.getFullName());
        templateContext.setVariable("taskKey", task.getTaskKey());
        templateContext.setVariable("taskTitle", task.getTitle());
        templateContext.setVariable("mentionContext", context);
        templateContext.setVariable("taskUrl", frontendUrl + "/tasks/" + task.getId());

        String htmlContent = templateEngine.process("email/mention-notification", templateContext);
        sendHtmlEmail(mentionedUser.getEmail(), sender.getFullName() + " mentioned you", htmlContent);
    }

    @Override
    @Async
    public void sendDeadlineReminderEmail(Task task, User assignee, int daysUntilDue) {
        Context context = new Context();
        context.setVariable("assigneeName", assignee.getFirstName());
        context.setVariable("taskKey", task.getTaskKey());
        context.setVariable("taskTitle", task.getTitle());
        context.setVariable("dueDate", task.getDueDate());
        context.setVariable("daysUntilDue", daysUntilDue);
        context.setVariable("taskUrl", frontendUrl + "/tasks/" + task.getId());

        String subject = daysUntilDue == 0 
                ? "Task Due Today: " + task.getTaskKey()
                : "Task Due in " + daysUntilDue + " day(s): " + task.getTaskKey();

        String htmlContent = templateEngine.process("email/deadline-reminder", context);
        sendHtmlEmail(assignee.getEmail(), subject, htmlContent);
    }

    @Override
    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        Context context = new Context();
        context.setVariable("userName", user.getFirstName());
        context.setVariable("resetUrl", frontendUrl + "/reset-password?token=" + resetToken);

        String htmlContent = templateEngine.process("email/password-reset", context);
        sendHtmlEmail(user.getEmail(), "Reset Your Password", htmlContent);
    }

    @Override
    @Async
    public void sendWelcomeEmail(User user) {
        Context context = new Context();
        context.setVariable("userName", user.getFirstName());
        context.setVariable("loginUrl", frontendUrl + "/login");

        String htmlContent = templateEngine.process("email/welcome", context);
        sendHtmlEmail(user.getEmail(), "Welcome to CirqueTask!", htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email sent to: {} with subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
