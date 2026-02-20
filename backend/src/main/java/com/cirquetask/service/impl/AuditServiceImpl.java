package com.cirquetask.service.impl;

import com.cirquetask.model.dto.AuditLogDto;
import com.cirquetask.model.entity.AuditLog;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.mapper.UserMapper;
import com.cirquetask.repository.AuditLogRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Async
    @Transactional
    public void logCreate(String entityType, Long entityId, Long userId) {
        saveAuditLog(entityType, entityId, "CREATE", null, null, null, userId);
    }

    @Override
    @Async
    @Transactional
    public void logUpdate(String entityType, Long entityId, String fieldName, 
            String oldValue, String newValue, Long userId) {
        saveAuditLog(entityType, entityId, "UPDATE", fieldName, oldValue, newValue, userId);
    }

    @Override
    @Async
    @Transactional
    public void logDelete(String entityType, Long entityId, Long userId) {
        saveAuditLog(entityType, entityId, "DELETE", null, null, null, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getEntityAuditLogs(String entityType, Long entityId, Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                entityType, entityId, pageable);
        return logs.map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getUserAuditLogs(Long userId, Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return logs.map(this::toDto);
    }

    private void saveAuditLog(String entityType, Long entityId, String action,
            String fieldName, String oldValue, String newValue, Long userId) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .user(user)
                .build();

        auditLogRepository.save(auditLog);
        log.debug("Audit log saved: {} {} {}", action, entityType, entityId);
    }

    private AuditLogDto toDto(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .action(auditLog.getAction())
                .fieldName(auditLog.getFieldName())
                .oldValue(auditLog.getOldValue())
                .newValue(auditLog.getNewValue())
                .user(auditLog.getUser() != null ? userMapper.toDto(auditLog.getUser()) : null)
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
