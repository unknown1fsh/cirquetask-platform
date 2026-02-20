package com.cirquetask.repository;

import com.cirquetask.model.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < ?1 OR t.usedAt IS NOT NULL")
    int deleteExpiredOrUsed(LocalDateTime now);

    void deleteByUserId(Long userId);
}
