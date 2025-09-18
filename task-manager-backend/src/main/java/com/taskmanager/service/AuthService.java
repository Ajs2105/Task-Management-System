package com.taskmanager.service;

import com.taskmanager.dto.ForgotPasswordRequest;
import com.taskmanager.dto.JwtResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.SignupRequest;
import com.taskmanager.model.Role;
import com.taskmanager.model.User;
import com.taskmanager.repo.RoleRepository;
import com.taskmanager.repo.UserRepository;
import com.taskmanager.security.JwtUtils;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       RoleRepository roleRepository, PasswordEncoder encoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());
        User user = userRepository.findByEmail(loginRequest.getEmail()).get();
        Set<String> roles = new java.util.HashSet<>();
        if (user.getRoles() != null) {
            for (Role r : user.getRoles()) {
                roles.add(r.getName());
            }
        }
        return new JwtResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), roles);
    }

    public String registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return "Error: Email is already in use!";
        }
        User u = new User();
        u.setFullName(signupRequest.getFullName());
        u.setEmail(signupRequest.getEmail());
        u.setPassword(encoder.encode(signupRequest.getPassword()));

        Role roleUser = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role r = new Role(); r.setName("ROLE_USER"); r.setDescription("Standard user");
            return roleRepository.save(r);
        });
        Set<Role> roles = new HashSet<>();
        roles.add(roleUser);
        u.setRoles(roles);
        userRepository.save(u);
        return "User registered successfully!";
    }

    // ✅ Forgot password functionality
    public String resetPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password reset successful!";
    }
}
