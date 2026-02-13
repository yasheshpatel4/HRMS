package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long referralId;

    @ManyToOne
    private Job job;

    @ManyToOne
    private User referrer;

    @NotBlank
    private String friendName;

    @Email
    private String friendEmail;

    private String cvFilePath;
    private String status;
    private String note;
    private LocalDateTime createdAt;
}