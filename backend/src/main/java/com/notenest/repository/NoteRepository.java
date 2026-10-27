package com.notenest.repository;

import com.notenest.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
    long countByArchivedFalse();
    long countByArchivedTrue();
    long countByPinnedTrueAndArchivedFalse();
}
