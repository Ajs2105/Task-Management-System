package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repo.UserRepository;
import com.taskmanager.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

        boolean isAdmin = u != null && u.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_SUPERADMIN".equals(r.getName()));

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
        return taskService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Create task:
     * - ADMIN / SUPERADMIN: can create for any user (dto may contain assigneeId / creatorId)
     * - USER: can only create tasks for themselves (creator set to current user, assignee default to them)
     */
    @PostMapping
    public ResponseEntity<Task> create(@RequestBody TaskDto dto, Authentication auth) {
        Long creatorId = null;
        User current = null;
        if (auth != null && auth.getName() != null) {
            current = userRepository.findByEmail(auth.getName()).orElse(null);
            if (current != null) creatorId = current.getId();
        }

        boolean isAdmin = current != null && current.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_SUPERADMIN".equals(r.getName()));

        if (isAdmin) {
            // Admin may override creatorId from DTO if provided
            if (dto.getCreatorId() != null) creatorId = dto.getCreatorId();
        } else {
            // Non-admin users cannot set creatorId in DTO (ignore if present) - creator stays current user
            // also ensure user is authenticated
            if (current == null) return ResponseEntity.status(401).build();
        }

        // Log incoming DTO for debugging assignment issues
        try {
            System.out.println("[TaskController] create() - incoming DTO: title=" + dto.getTitle()
                    + ", assigneeId=" + dto.getAssigneeId() + ", creatorId(dto)=" + dto.getCreatorId()
                    + ", creatorId(resolved)=" + creatorId);
        } catch (Exception ignore) {}

        // If a normal user didn't set assignee, it will be defaulted in service (createTask)
        Task t = taskService.createTask(dto, creatorId);
        return ResponseEntity.ok(t);
    }

    // Admin and super admin can update any task
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TaskDto dto) {
        try {
            Task t = taskService.updateTask(id, dto);
            return ResponseEntity.ok(t);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // User can update status of their own assigned or created tasks
    @PreAuthorize("hasRole('USER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody TaskDto dto, Authentication auth) {
        User u = null;
        if (auth != null && auth.getName() != null) {
            u = userRepository.findByEmail(auth.getName()).orElse(null);
        }
        if (u == null) return ResponseEntity.status(401).build();

        Task task = taskService.findById(id).orElse(null);
        if (task == null) return ResponseEntity.notFound().build();

        boolean isOwner = (task.getAssignee() != null && task.getAssignee().getId().equals(u.getId())) ||
                          (task.getCreator() != null && task.getCreator().getId().equals(u.getId()));
        if (!isOwner) return ResponseEntity.status(403).body("Not allowed");

        if (dto.getStatus() != null) {
            task.setStatus(dto.getStatus());
            taskService.save(task);
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.badRequest().body("Status required");
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
