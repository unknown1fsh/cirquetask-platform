package com.cirquetask.model.mapper;

import com.cirquetask.model.dto.BoardDto;
import com.cirquetask.model.dto.ColumnDto;
import com.cirquetask.model.entity.Board;
import com.cirquetask.model.entity.BoardColumn;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {TaskMapper.class})
public interface BoardMapper {

    @Mapping(target = "projectId", source = "project.id")
    BoardDto toDto(Board board);

    List<BoardDto> toDtoList(List<Board> boards);

    @Mapping(target = "taskCount", expression = "java(column.getTasks() != null ? column.getTasks().size() : 0)")
    @Mapping(target = "isWipLimitExceeded", expression = "java(isWipLimitExceeded(column))")
    ColumnDto toColumnDto(BoardColumn column);

    default Boolean isWipLimitExceeded(BoardColumn column) {
        if (column.getWipLimit() == null || column.getWipLimit() <= 0) {
            return false;
        }
        int taskCount = column.getTasks() != null ? column.getTasks().size() : 0;
        return taskCount > column.getWipLimit();
    }
}
