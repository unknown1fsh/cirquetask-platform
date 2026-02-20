package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.UserDto;
import com.cirquetask.model.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    UserDto toDto(User user);

    List<UserDto> toDtoList(List<User> users);
}
