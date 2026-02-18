package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Booking;
import com.example.hrms_backend.Entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking,Long> {

    @Query("Select b from Booking b where b.bookedBy.userId = :userId and b.status = :status")
    List<Booking> findByBookedByAndStatus(Long userId, BookingStatus status);

    @Query("Select b from Booking b where b.bookedBy.userId = :userId and b.status = 'active' and b.slot.startTime >= :startOfDay and b.slot.startTime < :endOfDay")
    Optional<Booking> findActiveBookingForUserOnDate(Long userId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query("Select b from Booking b where b.status = 'active' and b.slot.endTime >= :startTime order by b.slot.startTime")
    List<Booking> findUpcomingActiveBookings(LocalDateTime startTime);

    @Query("Select b from Booking b where b.status = 'active' and b.slot.game.gameId = :gameId and b.slot.startTime >= :startTime order by b.slot.startTime")
    List<Booking> findUpcomingActiveBookingsByGame(Long gameId, LocalDateTime startTime);

    @Query("Select b from Booking b where b.status = ?1 and b.slot.endTime < ?2")
    List<Booking> findByStatusAndSlotEndTimeBefore(BookingStatus status, LocalDateTime endTime);

}
