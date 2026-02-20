package com.cirquetask.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 255)
    private String name;

    private String description;

    @NotBlank(message = "Project prefix is required")
    @Size(min = 2, max = 10, message = "Prefix must be between 2 and 10 characters")
    private String prefix;

    private String color;
    private String icon;
}
