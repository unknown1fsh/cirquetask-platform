package com.cirquetask.service;

import com.cirquetask.model.dto.ActivityLogDto;

import java.util.List;

public interface ActivityLogService {

    void log(String action, String entityType, Long entityId, String description,
             String oldValue, String newValue, Long userId, Long projectId);

    List<ActivityLogDto> getProjectActivities(Long projectId, Long userId);

    List<ActivityLogDto> getUserActivities(Long userId);
}
