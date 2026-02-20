package com.cirquetask.service;

import com.cirquetask.model.dto.SearchRequest;
import com.cirquetask.model.dto.TaskDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchService {

    Page<TaskDto> searchTasks(SearchRequest request, Long userId, Pageable pageable);
}
