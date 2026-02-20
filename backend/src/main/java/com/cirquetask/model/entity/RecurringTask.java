package com.cirquetask.model.entity;

import com.cirquetask.model.enums.RecurrencePattern;
import com.cirquetask.model.enums.TaskPriority;
import com.cirquetask.model.enums.TaskType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class RecurringTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskType type = TaskType.TASK;

    @Column(name = "story_points")
    private Integer storyPoints;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id")
    private BoardColumn column;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_pattern", nullable = false)
    private RecurrencePattern recurrencePattern;

    @Column(name = "next_occurrence")
    private LocalDate nextOccurrence;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
