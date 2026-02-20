package com.cirquetask.repository;

import com.cirquetask.model.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByProjectIdOrderByCreatedAtDesc(Long projectId, Pageable pageable);

    List<ActivityLog> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);

    List<ActivityLog> findTop20ByProjectIdOrderByCreatedAtDesc(Long projectId);
}
