package com.notenest.service;

import com.notenest.dto.NoteRequest;
import com.notenest.entity.Note;
import com.notenest.exception.NoteNotFoundException;
import com.notenest.repository.NoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NoteServiceTest {
    NoteRepository repository;
    NoteService service;
    @BeforeEach void setup() { repository = Mockito.mock(NoteRepository.class); service = new NoteService(repository); }

    @Test void createsAndNormalizesNote() {
        when(repository.saveAndFlush(any(Note.class))).thenAnswer(i -> i.getArgument(0));
        var result = service.create(new NoteRequest("  Hello  ", "  World  ", "Study", "mint", List.of(" class ", "class")));
        assertEquals("Hello", result.title()); assertEquals("World", result.content());
        assertEquals(List.of("class"), result.tags());
        verify(repository).saveAndFlush(any(Note.class));
    }

    @Test void rejectsInvalidCategory() {
        assertThrows(IllegalArgumentException.class, () -> service.create(new NoteRequest("A", "B", "Invalid", "cream", List.of())));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void missingNoteReturnsNotFound() {
        when(repository.findById(42L)).thenReturn(Optional.empty());
        assertThrows(NoteNotFoundException.class, () -> service.get(42L));
    }

    @Test void togglesPinAndArchive() {
        Note note = new Note();
        when(repository.findById(1L)).thenReturn(Optional.of(note));
        when(repository.saveAndFlush(note)).thenReturn(note);
        assertTrue(service.togglePin(1L).pinned());
        assertTrue(service.toggleArchive(1L).archived());
    }
}
