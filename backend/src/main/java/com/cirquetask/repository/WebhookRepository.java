package com.cirquetask.repository;

import com.cirquetask.model.entity.Webhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, Long> {

    List<Webhook> findByProjectIdAndIsActiveTrue(Long projectId);

    List<Webhook> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
