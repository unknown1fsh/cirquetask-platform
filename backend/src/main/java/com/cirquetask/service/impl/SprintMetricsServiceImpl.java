package com.cirquetask.service.impl;

import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.BurndownDataPoint;
import com.cirquetask.model.dto.SprintMetricsDto;
import com.cirquetask.model.dto.VelocityDataPoint;
import com.cirquetask.model.entity.Sprint;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.enums.SprintStatus;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.repository.SprintRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.service.SprintMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SprintMetricsServiceImpl implements SprintMetricsService {

    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional(readOnly = true)
    public SprintMetricsDto getSprintBurndown(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        List<Task> tasks = taskRepository.findBySprintId(sprintId);

        int totalPoints = tasks.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        int completedPoints = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        int remainingPoints = totalPoints - completedPoints;
        double completionPercentage = totalPoints > 0 
                ? Math.round((double) completedPoints / totalPoints * 100 * 100.0) / 100.0 
                : 0;

        List<BurndownDataPoint> burndownData = calculateBurndownData(sprint, tasks);

        return SprintMetricsDto.builder()
                .sprintId(sprintId)
                .sprintName(sprint.getName())
                .totalPoints(totalPoints)
                .completedPoints(completedPoints)
                .remainingPoints(remainingPoints)
                .completionPercentage(completionPercentage)
                .burndownData(burndownData)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VelocityDataPoint> getProjectVelocity(Long projectId, int sprintCount) {
        List<Sprint> completedSprints = sprintRepository
                .findByProjectIdAndStatusOrderByStartDateAsc(projectId, SprintStatus.COMPLETED);

        int limit = Math.min(sprintCount, completedSprints.size());
        List<Sprint> recentSprints = completedSprints.subList(
                Math.max(0, completedSprints.size() - limit), 
                completedSprints.size()
        );

        return recentSprints.stream()
                .map(sprint -> VelocityDataPoint.builder()
                        .sprintId(sprint.getId())
                        .sprintName(sprint.getName())
                        .plannedPoints(sprint.getTotalPoints())
                        .completedPoints(sprint.getCompletedPoints())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageVelocity(Long projectId, int sprintCount) {
        List<VelocityDataPoint> velocityData = getProjectVelocity(projectId, sprintCount);

        if (velocityData.isEmpty()) {
            return 0.0;
        }

        double totalCompleted = velocityData.stream()
                .mapToInt(VelocityDataPoint::getCompletedPoints)
                .sum();

        return Math.round(totalCompleted / velocityData.size() * 100.0) / 100.0;
    }

    private List<BurndownDataPoint> calculateBurndownData(Sprint sprint, List<Task> tasks) {
        List<BurndownDataPoint> burndownData = new ArrayList<>();

        if (sprint.getStartDate() == null || sprint.getEndDate() == null) {
            return burndownData;
        }

        LocalDate startDate = sprint.getStartDate();
        LocalDate endDate = sprint.getEndDate();
        LocalDate today = LocalDate.now();

        int totalPoints = tasks.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double idealBurnRate = totalDays > 0 ? (double) totalPoints / totalDays : 0;

        LocalDate currentDate = startDate;
        int dayIndex = 0;

        while (!currentDate.isAfter(endDate) && !currentDate.isAfter(today)) {
            final LocalDate dateToCheck = currentDate;

            int completedByDate = tasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE 
                            && t.getCompletedAt() != null 
                            && !t.getCompletedAt().toLocalDate().isAfter(dateToCheck))
                    .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                    .sum();

            int remainingPoints = totalPoints - completedByDate;
            int idealRemaining = (int) Math.max(0, totalPoints - (idealBurnRate * (dayIndex + 1)));

            burndownData.add(BurndownDataPoint.builder()
                    .date(currentDate)
                    .remainingPoints(remainingPoints)
                    .completedPoints(completedByDate)
                    .idealPoints(idealRemaining)
                    .build());

            currentDate = currentDate.plusDays(1);
            dayIndex++;
        }

        return burndownData;
    }
}
