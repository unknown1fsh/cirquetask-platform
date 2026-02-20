package com.cirquetask.service.impl;

import com.cirquetask.model.dto.SearchRequest;
import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.model.entity.Task;
import com.cirquetask.model.mapper.TaskMapper;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.service.SearchService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final EntityManager entityManager;
    private final ProjectMemberRepository memberRepository;
    private final TaskMapper taskMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<TaskDto> searchTasks(SearchRequest request, Long userId, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Task> cq = cb.createQuery(Task.class);
        Root<Task> task = cq.from(Task.class);

        List<Predicate> predicates = buildPredicates(cb, task, request, userId);

        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(task.get("updatedAt")));

        TypedQuery<Task> query = entityManager.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<Task> tasks = query.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Task> countRoot = countQuery.from(Task.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(buildPredicates(cb, countRoot, request, userId).toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<TaskDto> dtos = tasks.stream().map(taskMapper::toDto).toList();
        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Task> task, SearchRequest request, Long userId) {
        List<Predicate> predicates = new ArrayList<>();

        if (request.getQuery() != null && !request.getQuery().isBlank()) {
            String searchPattern = "%" + request.getQuery().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(task.get("title")), searchPattern),
                    cb.like(cb.lower(task.get("description")), searchPattern),
                    cb.like(cb.lower(task.get("taskKey")), searchPattern)
            ));
        }

        if (request.getProjectIds() != null && !request.getProjectIds().isEmpty()) {
            predicates.add(task.get("project").get("id").in(request.getProjectIds()));
        }

        if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
            predicates.add(task.get("status").in(request.getStatuses()));
        }

        if (request.getPriorities() != null && !request.getPriorities().isEmpty()) {
            predicates.add(task.get("priority").in(request.getPriorities()));
        }

        if (request.getTypes() != null && !request.getTypes().isEmpty()) {
            predicates.add(task.get("type").in(request.getTypes()));
        }

        if (request.getDueDateFrom() != null) {
            predicates.add(cb.greaterThanOrEqualTo(task.get("dueDate"), request.getDueDateFrom()));
        }

        if (request.getDueDateTo() != null) {
            predicates.add(cb.lessThanOrEqualTo(task.get("dueDate"), request.getDueDateTo()));
        }

        if (request.getCreatedFrom() != null) {
            predicates.add(cb.greaterThanOrEqualTo(task.get("createdAt"), request.getCreatedFrom().atStartOfDay()));
        }

        if (request.getCreatedTo() != null) {
            predicates.add(cb.lessThanOrEqualTo(task.get("createdAt"), request.getCreatedTo().plusDays(1).atStartOfDay()));
        }

        return predicates;
    }
}
