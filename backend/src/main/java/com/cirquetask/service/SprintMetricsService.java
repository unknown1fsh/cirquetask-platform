package com.cirquetask.service;

import com.cirquetask.model.dto.SprintMetricsDto;
import com.cirquetask.model.dto.VelocityDataPoint;

import java.util.List;

public interface SprintMetricsService {

    SprintMetricsDto getSprintBurndown(Long sprintId);

    List<VelocityDataPoint> getProjectVelocity(Long projectId, int sprintCount);

    Double getAverageVelocity(Long projectId, int sprintCount);
}
