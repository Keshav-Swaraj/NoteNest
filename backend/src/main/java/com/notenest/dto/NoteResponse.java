package com.notenest.dto;

import com.notenest.entity.Note;
import java.time.Instant;
import java.util.List;

public record NoteResponse(Long id, String title, String content, String category, String color,
                           boolean pinned, boolean archived, List<String> tags, Instant createdAt, Instant updatedAt) {
    public static NoteResponse from(Note n) {
        return new NoteResponse(n.getId(), n.getTitle(), n.getContent(), n.getCategory(), n.getColor(),
                n.isPinned(), n.isArchived(), List.copyOf(n.getTags()), n.getCreatedAt(), n.getUpdatedAt());
    }
}
