package com.cirquetask.service;

import com.cirquetask.model.dto.TimeLogDto;
import com.cirquetask.model.dto.TimeLogRequest;

import java.time.LocalDate;
import java.util.List;

public interface TimeLogService {

    TimeLogDto logTime(TimeLogRequest request, Long userId);

    TimeLogDto getTimeLogById(Long timeLogId);

    List<TimeLogDto> getTimeLogsByTask(Long taskId);

    List<TimeLogDto> getTimeLogsByUser(Long userId);

    List<TimeLogDto> getTimeLogsByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    List<TimeLogDto> getTimeLogsByProject(Long projectId);

    List<TimeLogDto> getTimeLogsByProjectAndDateRange(Long projectId, LocalDate startDate, LocalDate endDate);

    TimeLogDto updateTimeLog(Long timeLogId, TimeLogRequest request, Long userId);

    void deleteTimeLog(Long timeLogId, Long userId);

    Integer getTotalMinutesByTask(Long taskId);

    Integer getTotalMinutesByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}
