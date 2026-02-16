package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Notification;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.NotificationRepository;
import com.example.hrms_backend.Repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    UserRepository userRepository;
    @Autowired
    NotificationRepository notificationRepository;

    public void createNotification(Long userId, String type, @NotBlank String message) {

        Notification notification=new Notification();
        notification.setMessage(message);
        notification.setType(type);
        User user=userRepository.findById(userId).orElseThrow(()->new RuntimeException("user not found"));
        notification.setUser(user);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

    }
    @Transactional
    public void markRead(Long id){
        notificationRepository.markRead(id);
    }

    public List<Notification> getNotification(Long userId) {
        User user=userRepository.findById(userId).orElseThrow(()->new RuntimeException("user not found"));
        return notificationRepository.findNotificationByUser(user);
    }
}
