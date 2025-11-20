package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repo.TaskRepository;
import com.taskmanager.repo.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Helper save - wraps repository.save so controllers can reuse.
     */
    public Task save(Task t) {
        return taskRepository.save(t);
    }

    public Task createTask(TaskDto dto, Long creatorId) {
        Task t = new Task();
        t.setTitle(dto.getTitle());
        t.setDescription(dto.getDescription());
        t.setStatus(dto.getStatus() == null ? "TODO" : dto.getStatus());
        t.setPriority(dto.getPriority() == null ? "MEDIUM" : dto.getPriority());
        if (dto.getAssigneeId() != null) {
            userRepository.findById(dto.getAssigneeId()).ifPresent(t::setAssignee);
        }
        if (creatorId != null) {
            userRepository.findById(creatorId).ifPresent(t::setCreator);
        }
        t.setDueDate(dto.getDueDate());
        Task saved = taskRepository.save(t);
        try {
            messagingTemplate.convertAndSend("/topic/tasks", saved);
        } catch (Exception ex) {
            // don't let WebSocket failure break the operation
            System.err.println("Warning: websocket broadcast failed: " + ex.getMessage());
        }
        return saved;
    }

    public List<Task> listAll() {
        return taskRepository.findAll();
    }

    public List<Task> listByUserId(Long userId) {
        // Show tasks where user is assignee or creator (avoid duplicates)
        List<Task> assigned = taskRepository.findByAssigneeId(userId);
        List<Task> created = taskRepository.findByCreatorId(userId);
        List<Task> merged = new ArrayList<>(assigned);
        for (Task t : created) {
            if (!merged.contains(t)) merged.add(t);
        }
        return merged;
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public Task updateTask(Long id, TaskDto dto) throws Exception {
        Task t = taskRepository.findById(id).orElseThrow(() -> new Exception("Task not found"));
        if (dto.getTitle() != null) t.setTitle(dto.getTitle());
        if (dto.getDescription() != null) t.setDescription(dto.getDescription());
        if (dto.getStatus() != null) t.setStatus(dto.getStatus());
        if (dto.getPriority() != null) t.setPriority(dto.getPriority());
        if (dto.getAssigneeId() != null) {
            userRepository.findById(dto.getAssigneeId()).ifPresent(t::setAssignee);
        }
        t.setDueDate(dto.getDueDate());
        Task updated = taskRepository.save(t);
        try {
            messagingTemplate.convertAndSend("/topic/tasks", updated);
        } catch (Exception ex) {
            System.err.println("Warning: websocket broadcast failed: " + ex.getMessage());
        }
        return updated;
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
