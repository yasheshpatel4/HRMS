package com.example.hrms_backend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @NotBlank(message = "Job title is required")
    @Size(min = 1, max = 200, message = "Job title must be between 1 and 200 characters")
    private String title;

    @Size(max = 1000, message = "Summary must not exceed 1000 characters")
    private String summary;
    private String jdFilePath;

    @NotBlank(message = "HR Email is required")
    @Email(message = "Invalid email format")
    private String hrEmail="dl.india.hr@gmail.com";

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "job_reviewers",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private Set<User> reviewers;
    private LocalDate createdAt;
    @ManyToOne
    private User createdBy;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "bit default 0")
    private boolean isDeleted = false;
}