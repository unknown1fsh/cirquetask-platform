package com.cirquetask.model.dto;

import com.cirquetask.model.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private UserDto sender;
    private Long projectId;
    private Long taskId;
    private LocalDateTime createdAt;
}
