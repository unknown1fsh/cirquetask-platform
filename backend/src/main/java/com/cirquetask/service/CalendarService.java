package com.cirquetask.service;

import com.cirquetask.model.dto.CalendarEventDto;

import java.time.LocalDate;
import java.util.List;

public interface CalendarService {

    List<CalendarEventDto> getUserCalendarEvents(Long userId, LocalDate startDate, LocalDate endDate);

    List<CalendarEventDto> getProjectCalendarEvents(Long projectId, LocalDate startDate, LocalDate endDate);
}
