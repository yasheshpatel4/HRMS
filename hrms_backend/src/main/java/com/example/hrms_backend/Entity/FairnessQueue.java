package com.example.hrms_backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
public class FairnessQueue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long queueId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @ManyToOne
    @JoinColumn(name = "game_id")
    @JsonIgnoreProperties({"configuration", "interestedUsers"})
    private Game game;

    private int slotsPlayedCurrentCycle = 0;
    private LocalDateTime requestTimestamp;

    @ElementCollection
    private Set<Long> participantIds = new HashSet<>();
}

