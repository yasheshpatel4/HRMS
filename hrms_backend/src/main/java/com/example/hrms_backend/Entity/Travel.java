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

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    @ManyToOne
    @JsonIgnore
    private User createdBy;

    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(
            name = "travel_user",
            joinColumns = @JoinColumn(name = "travel_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "userId")
    @JsonIdentityReference(alwaysAsId = true)
    private Set<User> assignedUsers = new HashSet<>();

    @NotNull(message = "Budget is required")
    @Min(value = 0, message = "Budget must be positive")
    private int budget;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "bit default 0")
    private boolean isDeleted = false;

}
