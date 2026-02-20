package com.cirquetask.controller;

import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.UserDto;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.mapper.UserMapper;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return ResponseEntity.ok(ApiResponse.success(userMapper.toDto(user)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (body.containsKey("firstName")) user.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName")) user.setLastName(body.get("lastName"));
        if (body.containsKey("bio")) user.setBio(body.get("bio"));
        if (body.containsKey("avatarUrl")) user.setAvatarUrl(body.get("avatarUrl"));

        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userMapper.toDto(user)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by email")
    public ResponseEntity<ApiResponse<List<UserDto>>> searchUsers(@RequestParam String email) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(email.toLowerCase()))
                .limit(10)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(userMapper.toDtoList(users)));
    }
}
