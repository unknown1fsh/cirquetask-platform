package com.cirquetask.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BoardDto {
    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private Integer position;
    private Boolean isDefault;
    private List<ColumnDto> columns;
    private LocalDateTime createdAt;
}
