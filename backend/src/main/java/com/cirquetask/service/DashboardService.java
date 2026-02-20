package com.cirquetask.service;

import com.cirquetask.model.dto.DashboardDto;

public interface DashboardService {

    DashboardDto getUserDashboard(Long userId);

    DashboardDto getProjectDashboard(Long projectId, Long userId);
}
