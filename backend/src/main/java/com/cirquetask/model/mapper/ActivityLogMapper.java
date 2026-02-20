package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.ActivityLogDto;
import com.cirquetask.model.entity.ActivityLog;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {UserMapper.class})
public interface ActivityLogMapper {

    @Mapping(target = "projectId", source = "project.id")
    ActivityLogDto toDto(ActivityLog activityLog);

    List<ActivityLogDto> toDtoList(List<ActivityLog> activityLogs);
}
