package com.cirquetask.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomFieldValueDto {

    private Long id;
    private Long definitionId;
    private String fieldName;
    private String fieldType;
    private String value;
}
