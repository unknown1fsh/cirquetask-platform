package com.cirquetask.service.impl;

import com.cirquetask.model.dto.ActivityLogDto;
import com.cirquetask.model.entity.ActivityLog;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.mapper.ActivityLogMapper;
import com.cirquetask.repository.ActivityLogRepository;
import com.cirquetask.repository.ProjectRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogMapper activityLogMapper;

    @Override
    @Async
    @Transactional
    public void log(String action, String entityType, Long entityId, String description,
                    String oldValue, String newValue, Long userId, Long projectId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            Project project = projectId != null ? projectRepository.findById(projectId).orElse(null) : null;

            ActivityLog activityLog = ActivityLog.builder()
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .user(user)
                    .project(project)
                    .build();

            activityLogRepository.save(activityLog);
        } catch (Exception e) {
            log.error("Failed to log activity: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> getProjectActivities(Long projectId, Long userId) {
        List<ActivityLog> logs = activityLogRepository.findTop20ByProjectIdOrderByCreatedAtDesc(projectId);
        return activityLogMapper.toDtoList(logs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> getUserActivities(Long userId) {
        List<ActivityLog> logs = activityLogRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
        return activityLogMapper.toDtoList(logs);
    }
}
