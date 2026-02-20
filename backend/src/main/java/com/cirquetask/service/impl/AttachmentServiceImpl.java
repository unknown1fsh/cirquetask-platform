package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.AttachmentDto;
import com.cirquetask.model.entity.Attachment;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.mapper.AttachmentMapper;
import com.cirquetask.repository.AttachmentRepository;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.repository.TaskRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;
    private final AttachmentMapper attachmentMapper;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public AttachmentDto upload(Long taskId, MultipartFile file, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateTaskAccess(task.getProject().getId(), userId);
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "file";
        }
        String storedName = UUID.randomUUID().toString() + "_" + sanitizeFileName(originalFilename);
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            log.error("Failed to save file: {}", e.getMessage());
            throw new BadRequestException("Failed to save file");
        }

        Attachment attachment = Attachment.builder()
                .fileName(originalFilename)
                .filePath(dir.resolve(storedName).toString())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .task(task)
                .uploadedBy(user)
                .build();
        attachment = attachmentRepository.save(attachment);
        log.info("Attachment uploaded: {} for task {}", attachment.getId(), taskId);
        return attachmentMapper.toDto(attachment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentDto> listByTaskId(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        validateTaskAccess(task.getProject().getId(), userId);
        return attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(attachmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Resource download(Long attachmentId, Long userId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));
        validateTaskAccess(attachment.getTask().getProject().getId(), userId);
        Path path = Paths.get(attachment.getFilePath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("File", "path", attachment.getFilePath());
        }
        try {
            return new UrlResource(path.toUri());
        } catch (IOException e) {
            throw new ResourceNotFoundException("File", "id", attachmentId);
        }
    }

    @Override
    @Transactional
    public void delete(Long attachmentId, Long userId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));
        validateTaskAccess(attachment.getTask().getProject().getId(), userId);
        try {
            Path path = Paths.get(attachment.getFilePath());
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            log.warn("Could not delete file from disk: {}", attachment.getFilePath());
        }
        attachmentRepository.delete(attachment);
        log.info("Attachment deleted: {}", attachmentId);
    }

    private void validateTaskAccess(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new AccessDeniedException("No access to this project");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentDto getAttachmentInfo(Long attachmentId, Long userId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));
        validateTaskAccess(attachment.getTask().getProject().getId(), userId);
        return attachmentMapper.toDto(attachment);
    }

    private static String sanitizeFileName(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
