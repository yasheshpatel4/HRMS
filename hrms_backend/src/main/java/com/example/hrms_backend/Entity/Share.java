package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
public class Share {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shareId;

    @ManyToOne
    private Job job;

    @ManyToOne
    private User sharedBy;

    @OneToMany(mappedBy = "share", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Recipient> recipients = new HashSet<>();

    private LocalDateTime sharedAt;
}
