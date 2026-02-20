package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.BoardDto;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Boards", description = "Kanban board management endpoints")
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/projects/{projectId}/boards")
    @Operation(summary = "Get all boards for a project")
    public ResponseEntity<ApiResponse<List<BoardDto>>> getProjectBoards(@PathVariable Long projectId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(boardService.getProjectBoards(projectId, userId)));
    }

    @GetMapping("/boards/{boardId}")
    @Operation(summary = "Get board with columns and tasks")
    public ResponseEntity<ApiResponse<BoardDto>> getBoard(@PathVariable Long boardId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(boardService.getBoard(boardId, userId)));
    }

    @PostMapping("/projects/{projectId}/boards")
    @Operation(summary = "Create a new board")
    public ResponseEntity<ApiResponse<BoardDto>> createBoard(@PathVariable Long projectId, @RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardDto board = boardService.createBoard(projectId, body.get("name"), body.get("description"), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Board created", board));
    }

    @PutMapping("/boards/{boardId}")
    @Operation(summary = "Update board")
    public ResponseEntity<ApiResponse<BoardDto>> updateBoard(@PathVariable Long boardId, @RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardDto board = boardService.updateBoard(boardId, body.get("name"), body.get("description"), userId);
        return ResponseEntity.ok(ApiResponse.success("Board updated", board));
    }

    @DeleteMapping("/boards/{boardId}")
    @Operation(summary = "Delete board")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(@PathVariable Long boardId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boardService.deleteBoard(boardId, userId);
        return ResponseEntity.ok(ApiResponse.success("Board deleted", null));
    }

    @PostMapping("/boards/{boardId}/columns")
    @Operation(summary = "Add a column to board")
    public ResponseEntity<ApiResponse<BoardDto>> addColumn(@PathVariable Long boardId, @RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        BoardDto board = boardService.addColumn(boardId, body.get("name"), body.get("color"), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Column added", board));
    }

    @DeleteMapping("/columns/{columnId}")
    @Operation(summary = "Remove a column")
    public ResponseEntity<ApiResponse<Void>> removeColumn(@PathVariable Long columnId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boardService.removeColumn(columnId, userId);
        return ResponseEntity.ok(ApiResponse.success("Column removed", null));
    }

    @PutMapping("/boards/{boardId}/columns/reorder")
    @Operation(summary = "Reorder columns")
    public ResponseEntity<ApiResponse<Void>> reorderColumns(@PathVariable Long boardId, @RequestBody List<Long> columnIds) {
        Long userId = SecurityUtils.getCurrentUserId();
        boardService.reorderColumns(boardId, columnIds, userId);
        return ResponseEntity.ok(ApiResponse.success("Columns reordered", null));
    }
}
