package com.cirquetask.repository;

import com.cirquetask.model.entity.CustomFieldDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomFieldDefinitionRepository extends JpaRepository<CustomFieldDefinition, Long> {

    List<CustomFieldDefinition> findByProjectIdOrderByDisplayOrderAsc(Long projectId);
}
