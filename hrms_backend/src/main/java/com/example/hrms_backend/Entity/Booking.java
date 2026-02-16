package com.example.hrms_backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @OneToOne
    @JoinColumn(name = "slot_id")
    private Slot slot;

    @ManyToOne
    @JoinColumn(name = "booked_by_id")
    private User bookedBy;

    private LocalDateTime bookedAt;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.ACTIVE;

    @ManyToMany
    @JoinTable(
            name = "booking_participants",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> participants = new HashSet<>();
}


