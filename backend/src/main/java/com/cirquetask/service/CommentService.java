package com.cirquetask.service;

import com.cirquetask.model.dto.CommentDto;
import com.cirquetask.model.dto.CommentRequest;

import java.util.List;

public interface CommentService {

    CommentDto addComment(Long taskId, CommentRequest request, Long userId);

    List<CommentDto> getTaskComments(Long taskId, Long userId);

    CommentDto updateComment(Long commentId, String content, Long userId);

    void deleteComment(Long commentId, Long userId);
}
