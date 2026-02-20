package com.cirquetask.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "board_columns")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class BoardColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 7)
    @Builder.Default
    private String color = "#94a3b8";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Builder.Default
    private Integer position = 0;

    @Column(name = "wip_limit")
    @Builder.Default
    private Integer wipLimit = 0;

    @Column(name = "is_done_column")
    @Builder.Default
    private Boolean isDoneColumn = false;

    @OneToMany(mappedBy = "column", cascade = CascadeType.ALL)
    @OrderBy("position ASC")
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
