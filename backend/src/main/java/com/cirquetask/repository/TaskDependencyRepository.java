package com.cirquetask.repository;

import com.cirquetask.model.entity.TaskDependency;
import com.cirquetask.model.enums.DependencyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskDependencyRepository extends JpaRepository<TaskDependency, Long> {

    List<TaskDependency> findBySourceTaskId(Long sourceTaskId);

    List<TaskDependency> findByTargetTaskId(Long targetTaskId);

    @Query("SELECT td FROM TaskDependency td WHERE td.sourceTask.id = :taskId OR td.targetTask.id = :taskId")
    List<TaskDependency> findAllByTaskId(@Param("taskId") Long taskId);

    Optional<TaskDependency> findBySourceTaskIdAndTargetTaskIdAndDependencyType(
            Long sourceTaskId, Long targetTaskId, DependencyType dependencyType);

    boolean existsBySourceTaskIdAndTargetTaskIdAndDependencyType(
            Long sourceTaskId, Long targetTaskId, DependencyType dependencyType);

    @Query("SELECT CASE WHEN COUNT(td) > 0 THEN true ELSE false END FROM TaskDependency td " +
           "WHERE td.sourceTask.id = :taskId AND td.dependencyType = 'BLOCKS' " +
           "AND td.targetTask.status != 'DONE' AND td.targetTask.status != 'CANCELLED'")
    boolean hasUnresolvedBlockingDependencies(@Param("taskId") Long taskId);

    void deleteBySourceTaskIdAndTargetTaskId(Long sourceTaskId, Long targetTaskId);
}
