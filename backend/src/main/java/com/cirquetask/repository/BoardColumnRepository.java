package com.cirquetask.repository;

import com.cirquetask.model.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, Long> {

    List<BoardColumn> findByBoardIdOrderByPositionAsc(Long boardId);
}
