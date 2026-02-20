package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.WorkflowRuleDto;
import com.cirquetask.model.entity.WorkflowRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkflowRuleMapper {

    private final UserMapper userMapper;

    public WorkflowRuleDto toDto(WorkflowRule rule) {
        if (rule == null) {
            return null;
        }

        return WorkflowRuleDto.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .projectId(rule.getProject().getId())
                .trigger(rule.getTrigger())
                .triggerValue(rule.getTriggerValue())
                .action(rule.getAction())
                .actionValue(rule.getActionValue())
                .isActive(rule.getIsActive())
                .createdBy(rule.getCreatedBy() != null ? userMapper.toDto(rule.getCreatedBy()) : null)
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }

    public List<WorkflowRuleDto> toDtoList(List<WorkflowRule> rules) {
        return rules.stream().map(this::toDto).toList();
    }
}
