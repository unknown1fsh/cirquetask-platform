package com.cirquetask.service;

import com.cirquetask.model.dto.BoardDto;

import java.util.List;

public interface BoardService {

    List<BoardDto> getProjectBoards(Long projectId, Long userId);

    BoardDto getBoard(Long boardId, Long userId);

    BoardDto createBoard(Long projectId, String name, String description, Long userId);

    BoardDto updateBoard(Long boardId, String name, String description, Long userId);

    void deleteBoard(Long boardId, Long userId);

    BoardDto addColumn(Long boardId, String name, String color, Long userId);

    void removeColumn(Long columnId, Long userId);

    void reorderColumns(Long boardId, List<Long> columnIds, Long userId);
}
