package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repo.UserRepository;
import com.taskmanager.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UserRepository userRepository;

    public TaskController(TaskService taskService, UserRepository userRepository) {
        this.taskService = taskService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Task>> list(Authentication auth) {
        User u = null;
        if (auth != null && auth.getName() != null) {
            u = userRepository.findByEmail(auth.getName()).orElse(null);
        }
        boolean isAdmin = u != null && u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_SUPER_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(taskService.listAll());
        } else if (u != null) {
            // Only show user's own tasks
            return ResponseEntity.ok(taskService.listByUserId(u.getId()));
        } else {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return taskService.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<Task> create(@RequestBody TaskDto dto, Authentication auth) {
        Long creatorId = null;
        if (auth != null && auth.getName() != null) {
            User u = userRepository.findByEmail(auth.getName()).orElse(null);
            if (u != null) creatorId = u.getId();
        }
        if (dto.getCreatorId() != null) creatorId = dto.getCreatorId();
        Task t = taskService.createTask(dto, creatorId);
        return ResponseEntity.ok(t);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TaskDto dto) {
        try {
            Task t = taskService.updateTask(id, dto);
            return ResponseEntity.ok(t);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
