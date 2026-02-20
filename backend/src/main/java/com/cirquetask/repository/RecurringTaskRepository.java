package com.cirquetask.repository;

import com.cirquetask.model.entity.RecurringTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTaskRepository extends JpaRepository<RecurringTask, Long> {

    List<RecurringTask> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    @Query("SELECT r FROM RecurringTask r WHERE r.isActive = true AND r.nextOccurrence <= :date " +
           "AND (r.endDate IS NULL OR r.endDate >= :date)")
    List<RecurringTask> findDueRecurringTasks(@Param("date") LocalDate date);
}
