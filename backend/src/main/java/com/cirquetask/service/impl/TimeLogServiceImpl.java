package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.TimeLogDto;
import com.cirquetask.model.dto.TimeLogRequest;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.TimeLog;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.mapper.TimeLogMapper;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.repository.TimeLogRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.TimeLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeLogServiceImpl implements TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TimeLogMapper timeLogMapper;

    @Override
    @Transactional
    public TimeLogDto logTime(TimeLogRequest request, Long userId) {
        Task task = findTaskById(request.getTaskId());
        User user = findUserById(userId);

        TimeLog timeLog = TimeLog.builder()
                .task(task)
                .user(user)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .description(request.getDescription())
                .loggedDate(request.getLoggedDate() != null ? request.getLoggedDate() : LocalDate.now())
                .build();

        timeLog = timeLogRepository.save(timeLog);

        updateTaskLoggedHours(task);

        log.info("Time logged: {} minutes for task {} by user {}", 
                request.getDurationMinutes(), task.getTaskKey(), userId);

        return timeLogMapper.toDto(timeLog);
    }

    @Override
    @Transactional(readOnly = true)
    public TimeLogDto getTimeLogById(Long timeLogId) {
        TimeLog timeLog = findTimeLogById(timeLogId);
        return timeLogMapper.toDto(timeLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogDto> getTimeLogsByTask(Long taskId) {
        findTaskById(taskId);
        List<TimeLog> timeLogs = timeLogRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return timeLogMapper.toDtoList(timeLogs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogDto> getTimeLogsByUser(Long userId) {
        List<TimeLog> timeLogs = timeLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return timeLogMapper.toDtoList(timeLogs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogDto> getTimeLogsByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        List<TimeLog> timeLogs = timeLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);
        return timeLogMapper.toDtoList(timeLogs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogDto> getTimeLogsByProject(Long projectId) {
        List<TimeLog> timeLogs = timeLogRepository.findByProjectId(projectId);
        return timeLogMapper.toDtoList(timeLogs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogDto> getTimeLogsByProjectAndDateRange(Long projectId, LocalDate startDate, LocalDate endDate) {
        List<TimeLog> timeLogs = timeLogRepository.findByProjectIdAndDateRange(projectId, startDate, endDate);
        return timeLogMapper.toDtoList(timeLogs);
    }

    @Override
    @Transactional
    public TimeLogDto updateTimeLog(Long timeLogId, TimeLogRequest request, Long userId) {
        TimeLog timeLog = findTimeLogById(timeLogId);

        if (!timeLog.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only update your own time logs");
        }

        timeLog.setStartTime(request.getStartTime());
        timeLog.setEndTime(request.getEndTime());
        timeLog.setDurationMinutes(request.getDurationMinutes());
        timeLog.setDescription(request.getDescription());
        if (request.getLoggedDate() != null) {
            timeLog.setLoggedDate(request.getLoggedDate());
        }

        timeLog = timeLogRepository.save(timeLog);

        updateTaskLoggedHours(timeLog.getTask());

        log.info("Time log updated: {}", timeLogId);

        return timeLogMapper.toDto(timeLog);
    }

    @Override
    @Transactional
    public void deleteTimeLog(Long timeLogId, Long userId) {
        TimeLog timeLog = findTimeLogById(timeLogId);

        if (!timeLog.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own time logs");
        }

        Task task = timeLog.getTask();
        timeLogRepository.delete(timeLog);

        updateTaskLoggedHours(task);

        log.info("Time log deleted: {}", timeLogId);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getTotalMinutesByTask(Long taskId) {
        return timeLogRepository.getTotalMinutesByTaskId(taskId);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getTotalMinutesByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return timeLogRepository.getTotalMinutesByUserIdAndDateRange(userId, startDate, endDate);
    }

    private void updateTaskLoggedHours(Task task) {
        Integer totalMinutes = timeLogRepository.getTotalMinutesByTaskId(task.getId());
        double hours = totalMinutes / 60.0;
        task.setLoggedHours(Math.round(hours * 100.0) / 100.0);
        taskRepository.save(task);
    }

    private TimeLog findTimeLogById(Long timeLogId) {
        return timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeLog", "id", timeLogId));
    }

    private Task findTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
