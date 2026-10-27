package com.notenest.config;

import com.notenest.dto.NoteRequest;
import com.notenest.repository.NoteRepository;
import com.notenest.service.NoteService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DemoData implements CommandLineRunner {
    private final NoteRepository repository;
    private final NoteService service;
    private final boolean enabled;
    public DemoData(NoteRepository repository, NoteService service, @Value("${app.seed.enabled:false}") boolean enabled) {
        this.repository = repository; this.service = service; this.enabled = enabled;
    }
    @Override public void run(String... args) {
        if (!enabled || repository.count() > 0) return;
        service.create(new NoteRequest("Welcome to NoteNest", "A quiet place to collect ideas, plans, and everything in between. Create a note to get started.", "Personal", "mint", List.of("welcome", "getting started")));
        service.create(new NoteRequest("This week's focus", "Review lecture notes, finish the project outline, and make space for a little reading.", "Study", "lavender", List.of("weekly", "planning")));
        service.create(new NoteRequest("A small idea", "The best ideas often start as one sentence. Save it here before it disappears.", "Ideas", "peach", List.of("inspiration")));
    }
}
