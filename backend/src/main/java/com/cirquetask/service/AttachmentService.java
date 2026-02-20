package com.cirquetask.service;

import com.cirquetask.model.dto.AttachmentDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {

    AttachmentDto upload(Long taskId, MultipartFile file, Long userId);

    List<AttachmentDto> listByTaskId(Long taskId, Long userId);

    Resource download(Long attachmentId, Long userId);

    void delete(Long attachmentId, Long userId);

    AttachmentDto getAttachmentInfo(Long attachmentId, Long userId);
}
