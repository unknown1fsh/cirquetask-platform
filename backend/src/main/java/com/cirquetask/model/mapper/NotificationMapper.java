package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.NotificationDto;
import com.cirquetask.model.entity.Notification;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {UserMapper.class})
public interface NotificationMapper {

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "taskId", source = "task.id")
    NotificationDto toDto(Notification notification);

    List<NotificationDto> toDtoList(List<Notification> notifications);
}
