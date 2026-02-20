package com.cirquetask.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabelRequest {

    @NotBlank(message = "Label name is required")
    @Size(max = 50)
    private String name;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a hex code (e.g. #6366f1)")
    @Size(max = 7)
    @Builder.Default
    private String color = "#6366f1";
}
