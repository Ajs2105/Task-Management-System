package com.taskmanager.dto;

import com.taskmanager.model.Task;
import com.taskmanager.model.Role;
import java.util.List;
import java.util.Set;

public class UserWithTasksDto {
    private Long id;
    private String fullName;
    private String email;
    private Set<Role> roles;
    private List<Task> assignedTasks;
    private List<Task> createdTasks;

    public UserWithTasksDto(Long id, String fullName, String email, Set<Role> roles, List<Task> assignedTasks, List<Task> createdTasks) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
        this.assignedTasks = assignedTasks;
        this.createdTasks = createdTasks;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Set<Role> getRoles() { return roles; }
    public List<Task> getAssignedTasks() { return assignedTasks; }
    public List<Task> getCreatedTasks() { return createdTasks; }
}
