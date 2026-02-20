package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {

    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private UserDto user;
    private LocalDateTime createdAt;
}
