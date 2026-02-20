package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.CommentDto;
import com.cirquetask.model.dto.CommentRequest;
import com.cirquetask.model.entity.Comment;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.mapper.CommentMapper;
import com.cirquetask.repository.CommentRepository;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.CommentService;
import com.cirquetask.service.MentionService;
import com.cirquetask.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;
    private final CommentMapper commentMapper;
    private final NotificationService notificationService;
    private final MentionService mentionService;

    @Override
    @Transactional
    public CommentDto addComment(Long taskId, CommentRequest request, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .author(author)
                .build();

        if (request.getParentCommentId() != null) {
            Comment parent = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentCommentId()));
            comment.setParentComment(parent);
        }

        comment = commentRepository.save(comment);

        // Send notification
        notificationService.sendCommentAdded(task, author);

        // Process @mentions
        mentionService.processMentions(request.getContent(), task.getProject().getId(), taskId, userId);

        return commentMapper.toDto(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentDto> getTaskComments(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateMembership(task.getProject().getId(), userId);

        List<Comment> comments = commentRepository.findByTaskIdAndParentCommentIsNullOrderByCreatedAtDesc(taskId);
        return commentMapper.toDtoList(comments);
    }

    @Override
    @Transactional
    public CommentDto updateComment(Long commentId, String content, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own comments");
        }

        comment.setContent(content);
        comment.setIsEdited(true);
        comment = commentRepository.save(comment);
        return commentMapper.toDto(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private void validateMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new AccessDeniedException("You are not a member of this project");
        }
    }
}
