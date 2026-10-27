package com.notenest.service;

import com.notenest.dto.*;
import com.notenest.entity.Note;
import com.notenest.exception.NoteNotFoundException;
import com.notenest.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class NoteService {
    public static final List<String> CATEGORIES = List.of("Personal", "Study", "Work", "Ideas", "Other");
    public static final List<String> COLORS = List.of("cream", "mint", "peach", "lavender", "sky", "rose");
    private final NoteRepository repository;
    public NoteService(NoteRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<NoteResponse> list(String q, String category, String tag, Boolean pinned, boolean archived, String sort) {
        Comparator<Note> comparator = switch (sort == null ? "updated" : sort) {
            case "updated" -> Comparator.comparing(Note::getUpdatedAt, Comparator.nullsFirst(Comparator.naturalOrder())).reversed();
            case "newest" -> Comparator.comparing(Note::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())).reversed();
            case "title" -> Comparator.comparing(Note::getTitle, String.CASE_INSENSITIVE_ORDER);
            default -> throw new IllegalArgumentException("Sort must be updated, newest, or title");
        };
        String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return repository.findAll().stream()
            .filter(n -> n.isArchived() == archived)
            .filter(n -> pinned == null || n.isPinned() == pinned)
            .filter(n -> category == null || category.isBlank() || n.getCategory().equalsIgnoreCase(category))
            .filter(n -> tag == null || tag.isBlank() || n.getTags().stream().anyMatch(t -> t.equalsIgnoreCase(tag)))
            .filter(n -> query.isEmpty() || n.getTitle().toLowerCase(Locale.ROOT).contains(query) || n.getContent().toLowerCase(Locale.ROOT).contains(query))
            .sorted(comparator).map(NoteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse get(Long id) { return NoteResponse.from(find(id)); }

    public NoteResponse create(NoteRequest request) {
        Note note = new Note();
        apply(note, request);
        return NoteResponse.from(repository.saveAndFlush(note));
    }

    public NoteResponse update(Long id, NoteRequest request) {
        Note note = find(id);
        apply(note, request);
        return NoteResponse.from(repository.saveAndFlush(note));
    }

    public void delete(Long id) { repository.delete(find(id)); }

    public NoteResponse togglePin(Long id) {
        Note note = find(id); note.setPinned(!note.isPinned());
        return NoteResponse.from(repository.saveAndFlush(note));
    }

    public NoteResponse toggleArchive(Long id) {
        Note note = find(id); note.setArchived(!note.isArchived());
        return NoteResponse.from(repository.saveAndFlush(note));
    }

    @Transactional(readOnly = true)
    public NoteStats stats() {
        return new NoteStats(repository.countByArchivedFalse(), repository.countByPinnedTrueAndArchivedFalse(), repository.countByArchivedTrue());
    }

    @Transactional(readOnly = true)
    public List<String> tags() {
        return repository.findAll().stream().flatMap(n -> n.getTags().stream())
            .collect(Collectors.toCollection(() -> new TreeSet<>(String.CASE_INSENSITIVE_ORDER))).stream().toList();
    }

    private Note find(Long id) { return repository.findById(id).orElseThrow(() -> new NoteNotFoundException(id)); }

    private void apply(Note note, NoteRequest request) {
        String category = request.category() == null || request.category().isBlank() ? "Other" : request.category().trim();
        String color = request.color() == null || request.color().isBlank() ? "cream" : request.color().trim();
        if (!CATEGORIES.contains(category)) throw new IllegalArgumentException("Choose a valid category");
        if (!COLORS.contains(color)) throw new IllegalArgumentException("Choose a valid note color");
        note.setTitle(request.title().trim()); note.setContent(request.content().trim());
        note.setCategory(category); note.setColor(color);
        Set<String> tags = new LinkedHashSet<>();
        if (request.tags() != null) for (String tag : request.tags()) {
            String cleaned = tag.trim();
            if (!cleaned.isEmpty()) tags.add(cleaned);
        }
        note.setTags(tags);
    }
}
