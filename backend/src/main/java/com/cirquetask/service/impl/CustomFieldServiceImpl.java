package com.cirquetask.service.impl;

import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.CustomFieldDefinitionDto;
import com.cirquetask.model.dto.CustomFieldValueDto;
import com.cirquetask.model.entity.CustomFieldDefinition;
import com.cirquetask.model.entity.CustomFieldValue;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.enums.CustomFieldType;
import com.cirquetask.repository.CustomFieldDefinitionRepository;
import com.cirquetask.repository.CustomFieldValueRepository;
import com.cirquetask.repository.ProjectRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.service.CustomFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomFieldServiceImpl implements CustomFieldService {

    private final CustomFieldDefinitionRepository definitionRepository;
    private final CustomFieldValueRepository valueRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public CustomFieldDefinitionDto createField(Long projectId, String name, CustomFieldType type,
            String description, List<String> dropdownOptions, Boolean isRequired) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        int order = definitionRepository.findByProjectIdOrderByDisplayOrderAsc(projectId).size();

        CustomFieldDefinition definition = CustomFieldDefinition.builder()
                .name(name)
                .description(description)
                .fieldType(type)
                .dropdownOptions(dropdownOptions != null ? String.join(",", dropdownOptions) : null)
                .isRequired(isRequired != null ? isRequired : false)
                .project(project)
                .displayOrder(order)
                .build();

        definition = definitionRepository.save(definition);
        return toDto(definition);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomFieldDefinitionDto> getProjectFields(Long projectId) {
        List<CustomFieldDefinition> definitions = definitionRepository.findByProjectIdOrderByDisplayOrderAsc(projectId);
        return definitions.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public void deleteField(Long fieldId) {
        valueRepository.deleteByDefinitionId(fieldId);
        definitionRepository.deleteById(fieldId);
    }

    @Override
    @Transactional
    public CustomFieldValueDto setFieldValue(Long taskId, Long definitionId, String value) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        CustomFieldDefinition definition = definitionRepository.findById(definitionId)
                .orElseThrow(() -> new ResourceNotFoundException("CustomFieldDefinition", "id", definitionId));

        CustomFieldValue fieldValue = valueRepository.findByTaskIdAndDefinitionId(taskId, definitionId)
                .orElse(CustomFieldValue.builder()
                        .task(task)
                        .definition(definition)
                        .build());

        fieldValue.setValue(value);
        fieldValue = valueRepository.save(fieldValue);

        return toValueDto(fieldValue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomFieldValueDto> getTaskFieldValues(Long taskId) {
        List<CustomFieldValue> values = valueRepository.findByTaskId(taskId);
        return values.stream().map(this::toValueDto).toList();
    }

    private CustomFieldDefinitionDto toDto(CustomFieldDefinition definition) {
        return CustomFieldDefinitionDto.builder()
                .id(definition.getId())
                .name(definition.getName())
                .description(definition.getDescription())
                .fieldType(definition.getFieldType())
                .dropdownOptions(definition.getDropdownOptions() != null 
                        ? Arrays.asList(definition.getDropdownOptions().split(",")) : null)
                .isRequired(definition.getIsRequired())
                .projectId(definition.getProject().getId())
                .displayOrder(definition.getDisplayOrder())
                .build();
    }

    private CustomFieldValueDto toValueDto(CustomFieldValue value) {
        return CustomFieldValueDto.builder()
                .id(value.getId())
                .definitionId(value.getDefinition().getId())
                .fieldName(value.getDefinition().getName())
                .fieldType(value.getDefinition().getFieldType().name())
                .value(value.getValue())
                .build();
    }
}
