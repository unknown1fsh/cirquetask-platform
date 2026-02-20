package com.cirquetask.service.impl;

import com.cirquetask.exception.AccessDeniedException;
import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.BoardDto;
import com.cirquetask.model.entity.Board;
import com.cirquetask.model.entity.BoardColumn;
import com.cirquetask.model.entity.Project;
import com.cirquetask.model.mapper.BoardMapper;
import com.cirquetask.repository.BoardColumnRepository;
import com.cirquetask.repository.BoardRepository;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.repository.ProjectRepository;
import com.cirquetask.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final BoardColumnRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final BoardMapper boardMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BoardDto> getProjectBoards(Long projectId, Long userId) {
        validateMembership(projectId, userId);
        List<Board> boards = boardRepository.findByProjectIdOrderByPositionAsc(projectId);
        return boardMapper.toDtoList(boards);
    }

    @Override
    @Transactional(readOnly = true)
    public BoardDto getBoard(Long boardId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
        validateMembership(board.getProject().getId(), userId);
        return boardMapper.toDto(board);
    }

    @Override
    @Transactional
    public BoardDto createBoard(Long projectId, String name, String description, Long userId) {
        validateMembership(projectId, userId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        List<Board> existingBoards = boardRepository.findByProjectIdOrderByPositionAsc(projectId);

        Board board = Board.builder()
                .name(name)
                .description(description)
                .project(project)
                .position(existingBoards.size())
                .isDefault(false)
                .build();

        board = boardRepository.save(board);

        // Create default columns
        String[][] defaultColumns = {
            {"To Do", "#3b82f6"}, {"In Progress", "#f59e0b"}, {"Done", "#22c55e"}
        };
        for (int i = 0; i < defaultColumns.length; i++) {
            BoardColumn col = BoardColumn.builder()
                    .name(defaultColumns[i][0])
                    .color(defaultColumns[i][1])
                    .board(board)
                    .position(i)
                    .isDoneColumn(i == defaultColumns.length - 1)
                    .build();
            columnRepository.save(col);
        }

        return boardMapper.toDto(boardRepository.findById(board.getId()).orElse(board));
    }

    @Override
    @Transactional
    public BoardDto updateBoard(Long boardId, String name, String description, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
        validateMembership(board.getProject().getId(), userId);

        board.setName(name);
        if (description != null) board.setDescription(description);
        board = boardRepository.save(board);
        return boardMapper.toDto(board);
    }

    @Override
    @Transactional
    public void deleteBoard(Long boardId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
        validateMembership(board.getProject().getId(), userId);

        if (board.getIsDefault()) {
            throw new BadRequestException("Cannot delete the default board");
        }
        boardRepository.delete(board);
    }

    @Override
    @Transactional
    public BoardDto addColumn(Long boardId, String name, String color, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
        validateMembership(board.getProject().getId(), userId);

        List<BoardColumn> existing = columnRepository.findByBoardIdOrderByPositionAsc(boardId);

        BoardColumn column = BoardColumn.builder()
                .name(name)
                .color(color != null ? color : "#94a3b8")
                .board(board)
                .position(existing.size())
                .isDoneColumn(false)
                .build();
        columnRepository.save(column);

        return boardMapper.toDto(boardRepository.findById(boardId).orElse(board));
    }

    @Override
    @Transactional
    public void removeColumn(Long columnId, Long userId) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("BoardColumn", "id", columnId));
        validateMembership(column.getBoard().getProject().getId(), userId);

        if (!column.getTasks().isEmpty()) {
            throw new BadRequestException("Cannot delete a column that contains tasks. Move tasks first.");
        }
        columnRepository.delete(column);
    }

    @Override
    @Transactional
    public void reorderColumns(Long boardId, List<Long> columnIds, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));
        validateMembership(board.getProject().getId(), userId);

        for (int i = 0; i < columnIds.size(); i++) {
            BoardColumn column = columnRepository.findById(columnIds.get(i))
                    .orElseThrow(() -> new ResourceNotFoundException("BoardColumn", "id", columnIds.get(0)));
            column.setPosition(i);
            columnRepository.save(column);
        }
    }

    private void validateMembership(Long projectId, Long userId) {
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new AccessDeniedException("You are not a member of this project");
        }
    }
}
