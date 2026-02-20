package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.CommentDto;
import com.cirquetask.model.entity.Comment;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {UserMapper.class})
public interface CommentMapper {

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "parentCommentId", source = "parentComment.id")
    @Mapping(target = "replies", ignore = true)
    CommentDto toDto(Comment comment);

    List<CommentDto> toDtoList(List<Comment> comments);
}
