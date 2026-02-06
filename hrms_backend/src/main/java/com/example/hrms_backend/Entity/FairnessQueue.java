package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class FairnessQueue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long queueId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

    private int slotsPlayedCurrentCycle;
    private LocalDateTime requestTimestamp;
}

