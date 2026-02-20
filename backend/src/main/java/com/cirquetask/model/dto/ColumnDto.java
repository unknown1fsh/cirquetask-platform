package com.cirquetask.model.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ColumnDto {
    private Long id;
    private String name;
    private String color;
    private Integer position;
    private Integer wipLimit;
    private Boolean isDoneColumn;
    private Integer taskCount;
    private Boolean isWipLimitExceeded;
    private List<TaskDto> tasks;
}
