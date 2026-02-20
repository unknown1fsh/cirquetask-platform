package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.TimeLogDto;
import com.cirquetask.model.entity.TimeLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TimeLogMapper {

    private final UserMapper userMapper;

    public TimeLogDto toDto(TimeLog timeLog) {
        if (timeLog == null) {
            return null;
        }

        return TimeLogDto.builder()
                .id(timeLog.getId())
                .taskId(timeLog.getTask().getId())
                .taskKey(timeLog.getTask().getTaskKey())
                .taskTitle(timeLog.getTask().getTitle())
                .user(userMapper.toDto(timeLog.getUser()))
                .startTime(timeLog.getStartTime())
                .endTime(timeLog.getEndTime())
                .durationMinutes(timeLog.getDurationMinutes())
                .description(timeLog.getDescription())
                .loggedDate(timeLog.getLoggedDate())
                .createdAt(timeLog.getCreatedAt())
                .build();
    }

    public List<TimeLogDto> toDtoList(List<TimeLog> timeLogs) {
        return timeLogs.stream().map(this::toDto).toList();
    }
}
