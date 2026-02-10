package com.example.hrms_backend.Service;

import jakarta.validation.constraints.NotBlank;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void createNotification(Long userId, String type, @NotBlank String message) {
    }
}
