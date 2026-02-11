package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Notification;
import com.example.hrms_backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,Long> {
    @Modifying
    @Query("update Notification n set n.read=true where n.notificationId=:id")
    void markRead(Long id);

    List<Notification> findNotificationByUser(User user);
}
