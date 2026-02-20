package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.AttachmentDto;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Attachments", description = "Task file attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(value = "/tasks/{taskId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload attachment to task")
    public ResponseEntity<ApiResponse<AttachmentDto>> upload(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        AttachmentDto dto = attachmentService.upload(taskId, file, userId);
        return ResponseEntity.ok(ApiResponse.success("File uploaded", dto));
    }

    @GetMapping("/tasks/{taskId}/attachments")
    @Operation(summary = "List attachments for task")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> listByTask(@PathVariable Long taskId) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<AttachmentDto> list = attachmentService.listByTaskId(taskId, userId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/attachments/{attachmentId}/download")
    @Operation(summary = "Download attachment")
    public ResponseEntity<Resource> download(@PathVariable Long attachmentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        AttachmentDto info = attachmentService.getAttachmentInfo(attachmentId, userId);
        Resource resource = attachmentService.download(attachmentId, userId);
        String filename = info.getFileName() != null ? info.getFileName() : "attachment";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    @Operation(summary = "Delete attachment")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long attachmentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        attachmentService.delete(attachmentId, userId);
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted", null));
    }
}
