package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.LabelDto;
import com.cirquetask.model.dto.LabelRequest;
import com.cirquetask.model.entity.Label;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.mapper.LabelMapper;
import com.cirquetask.repository.LabelRepository;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.repository.ProjectRepository;
import com.cirquetask.service.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LabelServiceImpl implements LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final LabelMapper labelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<LabelDto> listByProjectId(Long projectId, Long userId) {
        validateMembership(projectId, userId);
        return labelRepository.findByProjectId(projectId).stream()
                .map(labelMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public LabelDto create(Long projectId, LabelRequest request, Long userId) {
        validateMembership(projectId, userId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        Label label = Label.builder()
                .name(request.getName())
                .color(request.getColor() != null ? request.getColor() : "#6366f1")
                .project(project)
                .build();
        label = labelRepository.save(label);
        return labelMapper.toDto(label);
    }

    @Override
    @Transactional
    public LabelDto update(Long labelId, LabelRequest request, Long userId) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId));
        validateMembership(label.getProject().getId(), userId);
        label.setName(request.getName());
        if (request.getColor() != null) {
            label.setColor(request.getColor());
        }
        label = labelRepository.save(label);
        return labelMapper.toDto(label);
    }

    @Override
    @Transactional
    public void delete(Long labelId, Long userId) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", labelId));
        validateMembership(label.getProject().getId(), userId);
        labelRepository.delete(label);
    }

    private void validateMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new AccessDeniedException("You are not a member of this project");
        }
    }
}
