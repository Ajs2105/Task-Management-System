package com.taskmanager.controller;

import com.taskmanager.model.Role;
import com.taskmanager.repo.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Collections;
import com.taskmanager.model.User;
import com.taskmanager.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
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
    @Autowired
    private UserRepository userRepository;

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
