package com.cirquetask.controller;

import com.cirquetask.model.dto.*;
import com.cirquetask.model.enums.ProjectRole;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(@Valid @RequestBody ProjectRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProjectDto project = projectService.createProject(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Project created", project));
    }

    @GetMapping
    @Operation(summary = "Get all projects for current user")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getUserProjects() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<ProjectDto> projects = projectService.getUserProjects(userId);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getProject(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProjectDto project = projectService.getProject(id, userId);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProjectDto project = projectService.updateProject(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Project updated", project));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        projectService.deleteProject(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Project deleted", null));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get project members")
    public ResponseEntity<ApiResponse<List<MemberDto>>> getMembers(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<MemberDto> members = projectService.getMembers(id, userId);
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Add a member to project")
    public ResponseEntity<ApiResponse<MemberDto>> addMember(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        Long memberUserId = Long.valueOf(body.get("userId").toString());
        ProjectRole role = body.containsKey("role") ? ProjectRole.valueOf(body.get("role").toString()) : ProjectRole.MEMBER;
        MemberDto member = projectService.addMember(id, memberUserId, role, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Member added", member));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @Operation(summary = "Remove a member from project")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable Long id, @PathVariable Long memberId) {
        Long userId = SecurityUtils.getCurrentUserId();
        projectService.removeMember(id, memberId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed", null));
    }

    @PatchMapping("/{id}/members/{memberId}")
    @Operation(summary = "Update member role")
    public ResponseEntity<ApiResponse<MemberDto>> updateMemberRole(
            @PathVariable Long id, @PathVariable Long memberId, @RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProjectRole role = ProjectRole.valueOf(body.get("role"));
        MemberDto member = projectService.updateMemberRole(id, memberId, role, userId);
        return ResponseEntity.ok(ApiResponse.success("Role updated", member));
    }
}
