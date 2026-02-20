package com.cirquetask.service.impl;

import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.SprintDto;
import com.cirquetask.model.dto.SprintRequest;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.entity.Sprint;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.enums.SprintStatus;
import com.cirquetask.model.enums.TaskStatus;
import com.cirquetask.model.mapper.SprintMapper;
import com.cirquetask.repository.ProjectRepository;
import com.cirquetask.repository.SprintRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.service.ActivityLogService;
import com.cirquetask.service.SprintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SprintMapper sprintMapper;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public SprintDto createSprint(Long projectId, SprintRequest request) {
        Project project = findProjectById(projectId);

        validateSprintDates(request.getStartDate(), request.getEndDate());

        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SprintStatus.PLANNING)
                .project(project)
                .build();

        sprint = sprintRepository.save(sprint);
        log.info("Sprint created: {} for project: {}", sprint.getName(), projectId);

        return sprintMapper.toDto(sprint);
    }

    @Override
    @Transactional(readOnly = true)
    public SprintDto getSprintById(Long sprintId) {
        Sprint sprint = findSprintById(sprintId);
        return sprintMapper.toDto(sprint);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SprintDto> getSprintsByProject(Long projectId) {
        findProjectById(projectId);
        List<Sprint> sprints = sprintRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return sprintMapper.toDtoList(sprints);
    }

    @Override
    @Transactional(readOnly = true)
    public SprintDto getActiveSprint(Long projectId) {
        Sprint sprint = sprintRepository.findActiveSprintByProjectId(projectId)
                .orElse(null);
        return sprint != null ? sprintMapper.toDto(sprint) : null;
    }

    @Override
    @Transactional
    public SprintDto updateSprint(Long sprintId, SprintRequest request) {
        Sprint sprint = findSprintById(sprintId);

        if (sprint.getStatus() == SprintStatus.COMPLETED) {
            throw new BadRequestException("Cannot update a completed sprint");
        }

        validateSprintDates(request.getStartDate(), request.getEndDate());

        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());

        sprint = sprintRepository.save(sprint);
        log.info("Sprint updated: {}", sprintId);

        return sprintMapper.toDto(sprint);
    }

    @Override
    @Transactional
    public SprintDto startSprint(Long sprintId) {
        Sprint sprint = findSprintById(sprintId);

        if (sprint.getStatus() != SprintStatus.PLANNING) {
            throw new BadRequestException("Sprint can only be started from PLANNING status");
        }

        boolean hasActiveSprint = sprintRepository.existsByProjectIdAndStatus(
                sprint.getProject().getId(), SprintStatus.ACTIVE);
        if (hasActiveSprint) {
            throw new BadRequestException("Project already has an active sprint. Complete it first.");
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        recalculatePoints(sprint);

        sprint = sprintRepository.save(sprint);
        log.info("Sprint started: {}", sprintId);

        return sprintMapper.toDto(sprint);
    }

    @Override
    @Transactional
    public SprintDto completeSprint(Long sprintId) {
        Sprint sprint = findSprintById(sprintId);

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new BadRequestException("Only active sprints can be completed");
        }

        recalculatePoints(sprint);
        sprint.setStatus(SprintStatus.COMPLETED);
        sprint.setCompletedAt(LocalDateTime.now());

        sprint = sprintRepository.save(sprint);
        log.info("Sprint completed: {} with {} points", sprintId, sprint.getCompletedPoints());

        return sprintMapper.toDto(sprint);
    }

    @Override
    @Transactional
    public void deleteSprint(Long sprintId) {
        Sprint sprint = findSprintById(sprintId);

        if (sprint.getStatus() == SprintStatus.ACTIVE) {
            throw new BadRequestException("Cannot delete an active sprint. Complete or cancel it first.");
        }

        List<Task> tasks = sprint.getTasks();
        for (Task task : tasks) {
            task.setSprint(null);
            taskRepository.save(task);
        }

        sprintRepository.delete(sprint);
        log.info("Sprint deleted: {}", sprintId);
    }

    @Override
    @Transactional
    public SprintDto addTaskToSprint(Long sprintId, Long taskId) {
        Sprint sprint = findSprintById(sprintId);
        Task task = findTaskById(taskId);

        if (!task.getProject().getId().equals(sprint.getProject().getId())) {
            throw new BadRequestException("Task does not belong to the same project as the sprint");
        }

        task.setSprint(sprint);
        taskRepository.save(task);

        recalculatePoints(sprint);
        sprint = sprintRepository.save(sprint);

        log.info("Task {} added to sprint {}", taskId, sprintId);
        return sprintMapper.toDto(sprint);
    }

    @Override
    @Transactional
    public SprintDto removeTaskFromSprint(Long sprintId, Long taskId) {
        Sprint sprint = findSprintById(sprintId);
        Task task = findTaskById(taskId);

        if (task.getSprint() == null || !task.getSprint().getId().equals(sprintId)) {
            throw new BadRequestException("Task is not part of this sprint");
        }

        task.setSprint(null);
        taskRepository.save(task);

        recalculatePoints(sprint);
        sprint = sprintRepository.save(sprint);

        log.info("Task {} removed from sprint {}", taskId, sprintId);
        return sprintMapper.toDto(sprint);
    }

    @Override
    @Transactional
    public void recalculateSprintPoints(Long sprintId) {
        Sprint sprint = findSprintById(sprintId);
        recalculatePoints(sprint);
        sprintRepository.save(sprint);
    }

    private void recalculatePoints(Sprint sprint) {
        List<Task> tasks = taskRepository.findBySprintId(sprint.getId());

        int totalPoints = tasks.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        int completedPoints = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        sprint.setTotalPoints(totalPoints);
        sprint.setCompletedPoints(completedPoints);
    }

    private void validateSprintDates(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }
    }

    private Sprint findSprintById(Long sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));
    }

    private Project findProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
    }

    private Task findTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
    }
}
