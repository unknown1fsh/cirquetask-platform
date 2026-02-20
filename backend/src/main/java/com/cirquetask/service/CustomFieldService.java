package com.cirquetask.service;

import com.cirquetask.model.dto.CustomFieldDefinitionDto;
import com.cirquetask.model.dto.CustomFieldValueDto;
import com.cirquetask.model.enums.CustomFieldType;

import java.util.List;

public interface CustomFieldService {

    CustomFieldDefinitionDto createField(Long projectId, String name, CustomFieldType type, 
            String description, List<String> dropdownOptions, Boolean isRequired);

    List<CustomFieldDefinitionDto> getProjectFields(Long projectId);

    void deleteField(Long fieldId);

    CustomFieldValueDto setFieldValue(Long taskId, Long definitionId, String value);

    List<CustomFieldValueDto> getTaskFieldValues(Long taskId);
}
