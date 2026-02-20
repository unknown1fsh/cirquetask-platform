package com.cirquetask.service;

import java.time.LocalDate;

public interface ReportService {

    byte[] generateProjectReport(Long projectId, LocalDate startDate, LocalDate endDate, String format);

    byte[] generateSprintReport(Long sprintId, String format);

    byte[] generateUserTimesheetReport(Long userId, LocalDate startDate, LocalDate endDate, String format);
}
