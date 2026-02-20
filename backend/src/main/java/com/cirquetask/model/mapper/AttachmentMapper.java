package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.AttachmentDto;
import com.cirquetask.model.entity.Attachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = UserMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AttachmentMapper {

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "uploadedBy", source = "uploadedBy")
    AttachmentDto toDto(Attachment attachment);
}
