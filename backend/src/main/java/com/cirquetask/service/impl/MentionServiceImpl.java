package com.cirquetask.service.impl;

import com.cirquetask.model.entity.ProjectMember;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.MentionService;
import com.cirquetask.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentionServiceImpl implements MentionService {

    private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");

    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public Set<Long> extractMentionedUserIds(String content, Long projectId) {
        Set<Long> userIds = new HashSet<>();

        if (content == null || content.isBlank()) {
            return userIds;
        }

        Matcher matcher = MENTION_PATTERN.matcher(content);
        while (matcher.find()) {
            String email = matcher.group(1);
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId());
                if (isMember) {
                    userIds.add(user.getId());
                }
            }
        }

        return userIds;
    }

    @Override
    @Transactional
    public void processMentions(String content, Long projectId, Long taskId, Long senderId) {
        if (content == null || content.isBlank()) {
            return;
        }

        Set<Long> mentionedUserIds = extractMentionedUserIds(content, projectId);

        if (mentionedUserIds.isEmpty()) {
            return;
        }

        Task task = taskRepository.findById(taskId).orElse(null);
        User sender = userRepository.findById(senderId).orElse(null);

        if (task == null || sender == null) {
            log.warn("Could not process mentions: task or sender not found");
            return;
        }

        String contextPreview = content.length() > 100 ? content.substring(0, 100) + "..." : content;

        for (Long userId : mentionedUserIds) {
            if (!userId.equals(senderId)) {
                User mentionedUser = userRepository.findById(userId).orElse(null);
                if (mentionedUser != null) {
                    notificationService.sendMention(task, mentionedUser, sender, contextPreview);
                }
            }
        }

        log.info("Processed {} mentions in task {} by user {}", mentionedUserIds.size(), taskId, senderId);
    }
}
