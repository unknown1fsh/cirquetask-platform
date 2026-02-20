package com.cirquetask.service;

import com.cirquetask.model.dto.GanttTaskDto;

import java.util.List;

public interface GanttService {

    List<GanttTaskDto> getProjectGanttData(Long projectId);

    List<GanttTaskDto> getSprintGanttData(Long sprintId);
}
