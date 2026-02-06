package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    @OneToOne
    @JoinColumn(name = "game_id", unique = true)
    private Game game;

    private LocalTime startTime;
    private LocalTime endTime;
    private int duration;

}


