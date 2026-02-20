package com.cirquetask.repository;

import com.cirquetask.model.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :userId AND p.isArchived = false ORDER BY p.updatedAt DESC")
    List<Project> findByMemberUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Project p WHERE p.owner.id = :ownerId AND p.isArchived = false ORDER BY p.updatedAt DESC")
    List<Project> findByOwnerId(@Param("ownerId") Long ownerId);

    long countByOwnerIdAndIsArchivedFalse(Long ownerId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countTasksByProjectId(@Param("projectId") Long projectId);
}
