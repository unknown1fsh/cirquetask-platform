package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private String content;
    private UserDto author;
    private Long taskId;
    private Long parentCommentId;
    private List<CommentDto> replies;
    private Boolean isEdited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
