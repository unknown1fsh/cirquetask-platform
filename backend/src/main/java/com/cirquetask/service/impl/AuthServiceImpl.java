package com.cirquetask.service.impl;

import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.*;
import com.cirquetask.model.entity.PasswordResetToken;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.mapper.UserMapper;
import com.cirquetask.repository.PasswordResetTokenRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.security.CustomUserDetails;
import com.cirquetask.security.JwtTokenProvider;
import com.cirquetask.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    private static final int TOKEN_VALIDITY_HOURS = 1;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.of(accessToken, refreshToken, jwtTokenProvider.getJwtExpirationMs(), userMapper.toDto(user));
    }

    @Override
    @Transactional
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.of(accessToken, refreshToken, jwtTokenProvider.getJwtExpirationMs(), userMapper.toDto(user));
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String newAccessToken = jwtTokenProvider.generateAccessToken(userId, email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId, email);

        return AuthResponse.of(newAccessToken, newRefreshToken, jwtTokenProvider.getJwtExpirationMs(), userMapper.toDto(user));
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.debug("Forgot password requested for non-existent email: {}", email);
            return;
        }
        User user = userOpt.get();
        String token = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(TOKEN_VALIDITY_HOURS);
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(expiresAt)
                .build();
        passwordResetTokenRepository.save(resetToken);
        String resetLink = frontendUrl + "/auth/reset-password?token=" + token;
        log.info("Password reset link for {} (valid 1 hour): {}", user.getEmail(), resetLink);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (resetToken.isUsed()) {
            throw new BadRequestException("Reset token has already been used");
        }
        if (resetToken.isExpired()) {
            throw new BadRequestException("Reset token has expired");
        }
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
        log.info("Password reset completed for user: {}", user.getEmail());
    }
}
