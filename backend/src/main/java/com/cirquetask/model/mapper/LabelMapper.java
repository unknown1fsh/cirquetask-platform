package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.LabelDto;
import com.cirquetask.model.entity.Label;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LabelMapper {

    LabelDto toDto(Label label);
}
