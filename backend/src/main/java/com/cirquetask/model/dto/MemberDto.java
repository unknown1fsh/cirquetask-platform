package com.cirquetask.model.dto;

import com.cirquetask.model.enums.ProjectRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MemberDto {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String avatarUrl;
    private ProjectRole role;
    private LocalDateTime joinedAt;
}
