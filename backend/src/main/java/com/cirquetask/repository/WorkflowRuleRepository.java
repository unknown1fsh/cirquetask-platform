package com.cirquetask.repository;

import com.cirquetask.model.entity.WorkflowRule;
import com.cirquetask.model.enums.WorkflowTrigger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowRuleRepository extends JpaRepository<WorkflowRule, Long> {

    List<WorkflowRule> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<WorkflowRule> findByProjectIdAndIsActiveTrue(Long projectId);

    List<WorkflowRule> findByProjectIdAndTriggerAndIsActiveTrue(Long projectId, WorkflowTrigger trigger);
}
