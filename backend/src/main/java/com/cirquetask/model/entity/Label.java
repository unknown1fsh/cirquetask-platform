package com.cirquetask.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "labels")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Label {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 7)
    @Builder.Default
    private String color = "#6366f1";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}
