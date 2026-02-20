package com.cirquetask.service;

import com.cirquetask.model.dto.AuditLogDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditService {

    void logCreate(String entityType, Long entityId, Long userId);

    void logUpdate(String entityType, Long entityId, String fieldName, String oldValue, String newValue, Long userId);

    void logDelete(String entityType, Long entityId, Long userId);

    Page<AuditLogDto> getEntityAuditLogs(String entityType, Long entityId, Pageable pageable);

    Page<AuditLogDto> getUserAuditLogs(Long userId, Pageable pageable);
}
