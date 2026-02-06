package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gameId;

    @NotBlank
    private String gameName;

    private int maxPlayers;


    @OneToOne(mappedBy = "game")
    private Slot slot;

    @ManyToMany(mappedBy = "interestedGames")
    @JsonIgnore
    private Set<User> interestedUsers = new HashSet<>();
}

