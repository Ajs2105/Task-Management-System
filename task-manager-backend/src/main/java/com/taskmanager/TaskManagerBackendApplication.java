package com.taskmanager;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.taskmanager.model.User;
import com.taskmanager.model.Role;
import com.taskmanager.repo.UserRepository;
import com.taskmanager.repo.RoleRepository;
import java.util.Collections;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskManagerBackendApplication {

	@Bean
	public CommandLineRunner seedUsers(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Ensure roles exist
			Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
				Role r = new Role(); r.setName("ROLE_ADMIN"); r.setDescription("Admin role");
				return roleRepository.save(r);
			});
			Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN").orElseGet(() -> {
				Role r = new Role(); r.setName("ROLE_SUPER_ADMIN"); r.setDescription("Super admin role");
				return roleRepository.save(r);
			});

			// Seed admin user
			if (!userRepository.findByEmail("admin1@gmail.com").isPresent()) {
				User admin = new User();
				admin.setFullName("Admin");
				admin.setEmail("admin1@gmail.com");
				admin.setPassword(passwordEncoder.encode("Admin21"));
				admin.setRoles(Collections.singleton(adminRole));
				userRepository.save(admin);
			}

			// Seed super admin user
			if (!userRepository.findByEmail("superadmin@gmail.com").isPresent()) {
				User superAdmin = new User();
				superAdmin.setFullName("Super Admin");
				superAdmin.setEmail("superadmin@gmail.com");
				superAdmin.setPassword(passwordEncoder.encode("@dmin21"));
				superAdmin.setRoles(Collections.singleton(superAdminRole));
				userRepository.save(superAdmin);
			}
		};
	}

	public static void main(String[] args) {
		SpringApplication.run(TaskManagerBackendApplication.class, args);
	}

}
