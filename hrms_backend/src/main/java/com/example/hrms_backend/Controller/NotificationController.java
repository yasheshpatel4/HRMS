package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Notification;
import com.example.hrms_backend.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Notification")
public class NotificationController {
    @Autowired
    NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getNotification(@PathVariable Long userId){
        return ResponseEntity.ok(notificationService.getNotification(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markRead(@PathVariable Long notificationId){
        notificationService.markRead(notificationId);
        return ResponseEntity.ok("successful");
    }

}
