package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.SprintDto;
import com.cirquetask.model.entity.Sprint;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.enums.TaskStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SprintMapper {

    public SprintDto toDto(Sprint sprint) {
        if (sprint == null) {
            return null;
        }

        List<Task> tasks = sprint.getTasks();
        int taskCount = tasks != null ? tasks.size() : 0;
        int completedTaskCount = tasks != null
                ? (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count()
                : 0;

        double progress = taskCount > 0 ? (double) completedTaskCount / taskCount * 100 : 0;

        return SprintDto.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .projectId(sprint.getProject().getId())
                .completedPoints(sprint.getCompletedPoints())
                .totalPoints(sprint.getTotalPoints())
                .taskCount(taskCount)
                .completedTaskCount(completedTaskCount)
                .progress(Math.round(progress * 100.0) / 100.0)
                .completedAt(sprint.getCompletedAt())
                .createdAt(sprint.getCreatedAt())
                .updatedAt(sprint.getUpdatedAt())
                .build();
    }

    public List<SprintDto> toDtoList(List<Sprint> sprints) {
        return sprints.stream().map(this::toDto).toList();
    }
}
