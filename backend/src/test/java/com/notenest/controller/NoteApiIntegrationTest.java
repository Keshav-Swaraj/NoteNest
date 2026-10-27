package com.notenest.controller;

import com.notenest.repository.NoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:notenest-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "app.seed.enabled=false"
})
class NoteApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired NoteRepository repository;
    @BeforeEach void clean() { repository.deleteAll(); }

    @Test void createSearchPinArchiveAndDelete() throws Exception {
        String body = "{\"title\":\"Exam plan\",\"content\":\"Read chapter one\",\"category\":\"Study\",\"color\":\"mint\",\"tags\":[\"exam\",\"priority\"]}";
        String location = mvc.perform(post("/api/notes").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.title").value("Exam plan"))
            .andExpect(jsonPath("$.tags.length()").value(2)).andReturn().getResponse().getContentAsString();
        Long id = new com.fasterxml.jackson.databind.ObjectMapper().readTree(location).get("id").asLong();
        mvc.perform(get("/api/notes").param("q", "chapter").param("category", "Study").param("tag", "exam"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(patch("/api/notes/{id}/pin", id)).andExpect(status().isOk()).andExpect(jsonPath("$.pinned").value(true));
        mvc.perform(get("/api/notes/stats")).andExpect(jsonPath("$.total").value(1)).andExpect(jsonPath("$.pinned").value(1));
        mvc.perform(patch("/api/notes/{id}/archive", id)).andExpect(status().isOk()).andExpect(jsonPath("$.archived").value(true));
        mvc.perform(get("/api/notes")).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/notes/archived")).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(delete("/api/notes/{id}", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/notes/{id}", id)).andExpect(status().isNotFound()).andExpect(jsonPath("$.status").value(404));
    }

    @Test void invalidRequestReportsFields() throws Exception {
        mvc.perform(post("/api/notes").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"  \",\"content\":\"\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fields.title").exists()).andExpect(jsonPath("$.fields.content").exists());
    }
}
