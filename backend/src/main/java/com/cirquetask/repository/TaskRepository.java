package com.cirquetask.repository;

import com.cirquetask.model.entity.Task;
import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByColumnIdOrderByPositionAsc(Long columnId);

    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    @Query(value = "SELECT DISTINCT t.* FROM tasks t LEFT JOIN task_assignments a ON t.id = a.task_id " +
            "WHERE t.project_id = :projectId " +
            "AND (CAST(:status AS VARCHAR) IS NULL OR t.status = CAST(:status AS task_status)) " +
            "AND (CAST(:priority AS VARCHAR) IS NULL OR t.priority = CAST(:priority AS task_priority)) " +
            "AND (CAST(:assigneeId AS BIGINT) IS NULL OR a.user_id = CAST(:assigneeId AS BIGINT)) " +
            "ORDER BY t.created_at DESC", nativeQuery = true)
    List<Task> findByProjectIdWithFilters(@Param("projectId") Long projectId,
                                           @Param("status") String status,
                                           @Param("priority") String priority,
                                           @Param("assigneeId") Long assigneeId);

    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    @Query("SELECT t FROM Task t JOIN t.assignees a WHERE a.id = :userId ORDER BY t.updatedAt DESC")
    List<Task> findByAssigneeId(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t JOIN t.assignees a WHERE a.id = :userId AND t.status != 'DONE' AND t.status != 'CANCELLED' ORDER BY t.priority ASC, t.dueDate ASC")
    List<Task> findActiveTasksByAssigneeId(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.dueDate <= :date AND t.status != 'DONE' AND t.status != 'CANCELLED' ORDER BY t.dueDate ASC")
    List<Task> findUpcomingDeadlines(@Param("projectId") Long projectId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    Long countByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.priority = :priority")
    Long countByProjectIdAndPriority(@Param("projectId") Long projectId, @Param("priority") TaskPriority priority);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.dueDate < CURRENT_DATE AND t.status != 'DONE' AND t.status != 'CANCELLED'")
    Long countOverdueByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT MAX(CAST(SUBSTRING(t.taskKey, LENGTH(t.project.prefix) + 2) AS int)) FROM Task t WHERE t.project.id = :projectId")
    Integer findMaxTaskNumberByProjectId(@Param("projectId") Long projectId);

    List<Task> findByParentTaskId(Long parentTaskId);

    List<Task> findBySprintId(Long sprintId);

    List<Task> findBySprintIdOrderByPositionAsc(Long sprintId);

    @Query("SELECT t FROM Task t WHERE t.sprint.id = :sprintId AND t.status != 'DONE' AND t.status != 'CANCELLED' ORDER BY t.priority ASC")
    List<Task> findIncompleteTasksBySprintId(@Param("sprintId") Long sprintId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint.id = :sprintId")
    long countBySprintId(@Param("sprintId") Long sprintId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint.id = :sprintId AND t.status = 'DONE'")
    long countCompletedBySprintId(@Param("sprintId") Long sprintId);

    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :startDate AND :endDate " +
           "AND t.status != 'DONE' AND t.status != 'CANCELLED' ORDER BY t.dueDate ASC")
    List<Task> findTasksWithUpcomingDeadlines(
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);

    @Query("SELECT DISTINCT t FROM Task t JOIN t.assignees a WHERE a.id = :userId " +
           "AND t.dueDate BETWEEN :startDate AND :endDate ORDER BY t.dueDate ASC")
    List<Task> findUserTasksWithDueDateInRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
           "AND t.dueDate BETWEEN :startDate AND :endDate ORDER BY t.dueDate ASC")
    List<Task> findProjectTasksWithDueDateInRange(
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
