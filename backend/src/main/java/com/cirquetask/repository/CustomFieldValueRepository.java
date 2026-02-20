package com.cirquetask.repository;

import com.cirquetask.model.entity.CustomFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomFieldValueRepository extends JpaRepository<CustomFieldValue, Long> {

    List<CustomFieldValue> findByTaskId(Long taskId);

    Optional<CustomFieldValue> findByTaskIdAndDefinitionId(Long taskId, Long definitionId);

    void deleteByDefinitionId(Long definitionId);
}
