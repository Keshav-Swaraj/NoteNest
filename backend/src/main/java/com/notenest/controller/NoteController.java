package com.notenest.controller;

import com.notenest.dto.*;
import com.notenest.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class NoteController {
    private final NoteService service;
    public NoteController(NoteService service) { this.service = service; }

    @GetMapping("/notes")
    public List<NoteResponse> notes(@RequestParam(required = false) String q,
            @RequestParam(required = false) String category, @RequestParam(required = false) String tag,
            @RequestParam(required = false) Boolean pinned, @RequestParam(defaultValue = "false") boolean archived,
            @RequestParam(defaultValue = "updated") String sort) {
        return service.list(q, category, tag, pinned, archived, sort);
    }
    @GetMapping("/notes/search")
    public List<NoteResponse> search(@RequestParam String q, @RequestParam(defaultValue = "updated") String sort) {
        return service.list(q, null, null, null, false, sort);
    }
    @GetMapping("/notes/pinned") public List<NoteResponse> pinned() { return service.list(null, null, null, true, false, "updated"); }
    @GetMapping("/notes/archived") public List<NoteResponse> archived() { return service.list(null, null, null, null, true, "updated"); }
    @GetMapping("/notes/stats") public NoteStats stats() { return service.stats(); }
    @GetMapping("/notes/{id}") public NoteResponse note(@PathVariable Long id) { return service.get(id); }
    @PostMapping("/notes") public ResponseEntity<NoteResponse> create(@Valid @RequestBody NoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
    @PutMapping("/notes/{id}") public NoteResponse update(@PathVariable Long id, @Valid @RequestBody NoteRequest request) { return service.update(id, request); }
    @DeleteMapping("/notes/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id); return ResponseEntity.noContent().build();
    }
    @PatchMapping("/notes/{id}/pin") public NoteResponse pin(@PathVariable Long id) { return service.togglePin(id); }
    @PatchMapping("/notes/{id}/archive") public NoteResponse archive(@PathVariable Long id) { return service.toggleArchive(id); }
    @GetMapping("/categories") public List<String> categories() { return NoteService.CATEGORIES; }
    @GetMapping("/tags") public List<String> tags() { return service.tags(); }
}
