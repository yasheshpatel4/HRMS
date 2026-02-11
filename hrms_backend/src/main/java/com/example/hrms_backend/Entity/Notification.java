package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne
    @JsonBackReference
    private User user;

    @NotBlank
    private String message;

    private String type;
    @Column(name = "isRead")
    private Boolean read = false;

    private LocalDateTime createdAt;
}