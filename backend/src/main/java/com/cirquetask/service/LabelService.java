package com.cirquetask.service;

import com.cirquetask.model.dto.LabelDto;
import com.cirquetask.model.dto.LabelRequest;

import java.util.List;

public interface LabelService {

    List<LabelDto> listByProjectId(Long projectId, Long userId);

    LabelDto create(Long projectId, LabelRequest request, Long userId);

    LabelDto update(Long labelId, LabelRequest request, Long userId);

    void delete(Long labelId, Long userId);
}
