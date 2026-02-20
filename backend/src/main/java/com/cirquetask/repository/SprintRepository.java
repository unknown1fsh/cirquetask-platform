package com.cirquetask.repository;

import com.cirquetask.model.entity.Sprint;
import com.cirquetask.model.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Sprint> findByProjectIdAndStatusOrderByStartDateAsc(Long projectId, SprintStatus status);

    Optional<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);

    @Query("SELECT s FROM Sprint s WHERE s.project.id = :projectId AND s.status = 'ACTIVE'")
    Optional<Sprint> findActiveSprintByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(s) FROM Sprint s WHERE s.project.id = :projectId")
    long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT s FROM Sprint s WHERE s.project.id = :projectId AND s.status IN ('PLANNING', 'ACTIVE') ORDER BY s.startDate ASC")
    List<Sprint> findUpcomingSprintsByProjectId(@Param("projectId") Long projectId);

    boolean existsByProjectIdAndStatus(Long projectId, SprintStatus status);
}
