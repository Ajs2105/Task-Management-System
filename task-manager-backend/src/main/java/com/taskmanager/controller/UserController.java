package com.taskmanager.controller;

import com.taskmanager.model.Role;
import com.taskmanager.model.User;
import com.taskmanager.repo.RoleRepository;
import com.taskmanager.repo.TaskRepository;
import com.taskmanager.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import com.taskmanager.dto.UserWithTasksDto;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ Create User (SUPER_ADMIN only)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user, @RequestParam String role) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        Role r = roleRepository.findByName(role).orElse(null);
        if (r == null) return ResponseEntity.badRequest().body("Role not found");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Collections.singleton(r));
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // ✅ List Users (ADMIN + SUPER_ADMIN)
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @GetMapping
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    // ✅ Get all users with their tasks (ADMIN + SUPER_ADMIN)
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @GetMapping("/with-tasks")
    public ResponseEntity<?> getAllUsersWithTasks() {
        List<User> users = userRepository.findAll();
        List<UserWithTasksDto> result = users.stream().map(u ->
            new UserWithTasksDto(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getRoles(),
                taskRepository.findByAssigneeId(u.getId()),
                taskRepository.findByCreatorId(u.getId())
            )
        ).toList();
        return ResponseEntity.ok(result);
    }

    // ✅ Get one user’s tasks (ADMIN, SUPER_ADMIN, or the user themselves)
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN') or #id == principal.id")
    @GetMapping("/{id}/tasks")
    public ResponseEntity<?> getUserTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskRepository.findByAssigneeId(id));
    }

    // ✅ Delete user (SUPER_ADMIN only, but not self)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        User current = userRepository.findByEmail(auth.getName()).orElse(null);
        if (current != null && current.getId().equals(id)) {
            return ResponseEntity.badRequest().body("Super admin cannot delete themselves");
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
