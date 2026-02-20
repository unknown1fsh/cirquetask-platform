package com.cirquetask.service;

import com.cirquetask.model.dto.SprintDto;
import com.cirquetask.model.dto.SprintRequest;

import java.util.List;

public interface SprintService {

    SprintDto createSprint(Long projectId, SprintRequest request);

    SprintDto getSprintById(Long sprintId);

    List<SprintDto> getSprintsByProject(Long projectId);

    SprintDto getActiveSprint(Long projectId);

    SprintDto updateSprint(Long sprintId, SprintRequest request);

    SprintDto startSprint(Long sprintId);

    SprintDto completeSprint(Long sprintId);

    void deleteSprint(Long sprintId);

    SprintDto addTaskToSprint(Long sprintId, Long taskId);

    SprintDto removeTaskFromSprint(Long sprintId, Long taskId);

    void recalculateSprintPoints(Long sprintId);
}
