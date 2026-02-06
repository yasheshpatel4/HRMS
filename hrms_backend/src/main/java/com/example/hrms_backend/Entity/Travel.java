package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class Travel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long travelId;

    @NotBlank
    private String title;

    private String description;

    @FutureOrPresent
    private LocalDate startDate;

    @Future
    private LocalDate endDate;

    @ManyToOne
    private User createdBy;

    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(
            name = "travel_user",
            joinColumns = @JoinColumn(name = "travel_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonManagedReference
    private Set<User> assignedUsers = new HashSet<>();
}
