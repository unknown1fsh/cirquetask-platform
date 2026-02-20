package com.cirquetask.service;

import com.cirquetask.model.dto.AuthRequest;
import com.cirquetask.model.dto.AuthResponse;
import com.cirquetask.model.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(AuthRequest request);

    AuthResponse refreshToken(String refreshToken);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);
}
