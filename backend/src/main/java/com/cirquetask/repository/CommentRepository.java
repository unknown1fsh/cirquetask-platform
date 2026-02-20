package com.cirquetask.repository;

import com.cirquetask.model.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTaskIdAndParentCommentIsNullOrderByCreatedAtDesc(Long taskId);

    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    Long countByTaskId(Long taskId);
}
