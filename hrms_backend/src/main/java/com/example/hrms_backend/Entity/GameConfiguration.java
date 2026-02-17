package com.example.hrms_backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@Table
@Entity
public class GameConfiguration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long configId;

    @OneToOne
    @JoinColumn(name = "game_id")
    @JsonIgnoreProperties({"configuration", "interestedUsers"})
    private Game game;

    private LocalTime operatingHoursStart;
    private LocalTime operatingHoursEnd;
    private int slotDurationMins;
    private int maxPlayers;
}