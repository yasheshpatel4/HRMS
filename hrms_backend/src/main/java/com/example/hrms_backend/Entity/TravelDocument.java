package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class TravelDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long docId;

    @ManyToOne
    private Travel travel;

    @ManyToOne
    private User user;

    @NotBlank
    private String uploadedBy;

    private String docType;

    @NotBlank
    private String filePath;

    private LocalDateTime createdAt;
}