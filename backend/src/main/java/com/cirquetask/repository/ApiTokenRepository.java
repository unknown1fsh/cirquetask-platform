package com.cirquetask.repository;

import com.cirquetask.model.entity.ApiToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiTokenRepository extends JpaRepository<ApiToken, Long> {

    List<ApiToken> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ApiToken> findByTokenPrefixAndIsActiveTrue(String tokenPrefix);
}
