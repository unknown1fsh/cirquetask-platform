package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ActivityLogDto {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String description;
    private String oldValue;
    private String newValue;
    private UserDto user;
    private Long projectId;
    private LocalDateTime createdAt;
}
