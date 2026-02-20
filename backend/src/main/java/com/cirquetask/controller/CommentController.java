package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.CommentDto;
import com.cirquetask.model.dto.CommentRequest;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Task comment endpoints")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/tasks/{taskId}/comments")
    @Operation(summary = "Add a comment to a task")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(@PathVariable Long taskId, @Valid @RequestBody CommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CommentDto comment = commentService.addComment(taskId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comment added", comment));
    }

    @GetMapping("/tasks/{taskId}/comments")
    @Operation(summary = "Get all comments for a task")
    public ResponseEntity<ApiResponse<List<CommentDto>>> getTaskComments(@PathVariable Long taskId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(commentService.getTaskComments(taskId, userId)));
    }

    @PutMapping("/comments/{commentId}")
    @Operation(summary = "Update comment")
    public ResponseEntity<ApiResponse<CommentDto>> updateComment(@PathVariable Long commentId, @RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        CommentDto comment = commentService.updateComment(commentId, body.get("content"), userId);
        return ResponseEntity.ok(ApiResponse.success("Comment updated", comment));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }
}
