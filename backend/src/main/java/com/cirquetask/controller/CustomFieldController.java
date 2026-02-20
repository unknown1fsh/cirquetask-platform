package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.CustomFieldDefinitionDto;
import com.cirquetask.model.dto.CustomFieldValueDto;
import com.cirquetask.model.enums.CustomFieldType;
import com.cirquetask.model.enums.Feature;
import com.cirquetask.service.CustomFieldService;
import com.cirquetask.service.PlanLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Custom Fields", description = "Custom field management endpoints")
public class CustomFieldController {

    private final CustomFieldService customFieldService;
    private final PlanLimitService planLimitService;

    @PostMapping("/projects/{projectId}/custom-fields")
    @Operation(summary = "Create a custom field for a project")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<CustomFieldDefinitionDto>> createField(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> body) {
        planLimitService.requireProjectFeature(projectId, Feature.CUSTOM_FIELDS);
        String name = (String) body.get("name");
        CustomFieldType type = CustomFieldType.valueOf((String) body.get("fieldType"));
        String description = (String) body.get("description");
        List<String> dropdownOptions = (List<String>) body.get("dropdownOptions");
        Boolean isRequired = (Boolean) body.get("isRequired");

        CustomFieldDefinitionDto field = customFieldService.createField(
                projectId, name, type, description, dropdownOptions, isRequired);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Custom field created", field));
    }

    @GetMapping("/projects/{projectId}/custom-fields")
    @Operation(summary = "Get all custom fields for a project")
    public ResponseEntity<ApiResponse<List<CustomFieldDefinitionDto>>> getProjectFields(@PathVariable Long projectId) {
        planLimitService.requireProjectFeature(projectId, Feature.CUSTOM_FIELDS);
        List<CustomFieldDefinitionDto> fields = customFieldService.getProjectFields(projectId);
        return ResponseEntity.ok(ApiResponse.success(fields));
    }

    @DeleteMapping("/custom-fields/{fieldId}")
    @Operation(summary = "Delete a custom field")
    public ResponseEntity<ApiResponse<Void>> deleteField(@PathVariable Long fieldId) {
        planLimitService.requireCustomFieldDefinitionProjectFeature(fieldId, Feature.CUSTOM_FIELDS);
        customFieldService.deleteField(fieldId);
        return ResponseEntity.ok(ApiResponse.success("Custom field deleted", null));
    }

    @PutMapping("/tasks/{taskId}/custom-fields/{definitionId}")
    @Operation(summary = "Set custom field value for a task")
    public ResponseEntity<ApiResponse<CustomFieldValueDto>> setFieldValue(
            @PathVariable Long taskId,
            @PathVariable Long definitionId,
            @RequestBody Map<String, String> body) {
        planLimitService.requireTaskProjectFeature(taskId, Feature.CUSTOM_FIELDS);
        String value = body.get("value");
        CustomFieldValueDto fieldValue = customFieldService.setFieldValue(taskId, definitionId, value);
        return ResponseEntity.ok(ApiResponse.success("Field value set", fieldValue));
    }

    @GetMapping("/tasks/{taskId}/custom-fields")
    @Operation(summary = "Get all custom field values for a task")
    public ResponseEntity<ApiResponse<List<CustomFieldValueDto>>> getTaskFieldValues(@PathVariable Long taskId) {
        planLimitService.requireTaskProjectFeature(taskId, Feature.CUSTOM_FIELDS);
        List<CustomFieldValueDto> values = customFieldService.getTaskFieldValues(taskId);
        return ResponseEntity.ok(ApiResponse.success(values));
    }
}
