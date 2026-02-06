package com.example.hrms_backend.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank
    private String name;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    @NotBlank
    private String password;

    @Past
    private LocalDate dob;

    @PastOrPresent
    private LocalDate doj;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    private String department;
    private String designation;

    private String ProfilePhoto;

    @ManyToMany
    @JoinTable(
            name = "user_interested_games",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<Game> interestedGames = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "role_user",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @JsonManagedReference
    private Set<Role> roles = new HashSet<>();

    private int completedGames = 0;

    @ManyToMany(mappedBy = "participants")
    private Set<Booking> bookings = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private List<FairnessQueue> gameFairnessStats;
}
