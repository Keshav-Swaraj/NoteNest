package com.notenest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record NoteRequest(
    @NotBlank(message = "Title is required") @Size(max = 160) String title,
    @NotBlank(message = "Content is required") String content,
    String category,
    String color,
    @Size(max = 10, message = "Use at most 10 tags") List<@NotBlank @Size(max = 40) String> tags
) {}
