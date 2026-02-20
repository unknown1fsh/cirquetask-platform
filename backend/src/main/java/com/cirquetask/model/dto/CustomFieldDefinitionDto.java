package com.cirquetask.model.dto;

import com.cirquetask.model.enums.CustomFieldType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomFieldDefinitionDto {

    private Long id;
    private String name;
    private String description;
    private CustomFieldType fieldType;
    private List<String> dropdownOptions;
    private Boolean isRequired;
    private Long projectId;
    private Integer displayOrder;
}
