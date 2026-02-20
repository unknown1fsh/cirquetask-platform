package com.cirquetask.repository;

import com.cirquetask.model.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {

    List<TimeLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    List<TimeLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT t FROM TimeLog t WHERE t.user.id = :userId AND t.loggedDate BETWEEN :startDate AND :endDate ORDER BY t.loggedDate DESC, t.createdAt DESC")
    List<TimeLog> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM TimeLog t WHERE t.task.project.id = :projectId ORDER BY t.createdAt DESC")
    List<TimeLog> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT t FROM TimeLog t WHERE t.task.project.id = :projectId AND t.loggedDate BETWEEN :startDate AND :endDate ORDER BY t.loggedDate DESC")
    List<TimeLog> findByProjectIdAndDateRange(
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeLog t WHERE t.task.id = :taskId")
    Integer getTotalMinutesByTaskId(@Param("taskId") Long taskId);

    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeLog t WHERE t.user.id = :userId AND t.loggedDate BETWEEN :startDate AND :endDate")
    Integer getTotalMinutesByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeLog t WHERE t.task.project.id = :projectId")
    Integer getTotalMinutesByProjectId(@Param("projectId") Long projectId);
}
