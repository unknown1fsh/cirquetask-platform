package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {
    private Long id;
    private String fileName;
    private Long fileSize;
    private String contentType;
    private Long taskId;
    private UserDto uploadedBy;
    private LocalDateTime createdAt;
}
