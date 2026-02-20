package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String prefix;
    private String color;
    private String icon;
    private Boolean isArchived;
    private UserDto owner;
    private Integer memberCount;
    private Integer taskCount;
    private List<MemberDto> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
