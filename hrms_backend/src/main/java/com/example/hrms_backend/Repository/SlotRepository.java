package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    @Query("SELECT s FROM Slot s WHERE s.game.gameId = :gameId AND s.startTime >= :startTime AND s.isAvailable = true ORDER BY s.startTime")
    List<Slot> findAvailableSlotsFrom(Long gameId, LocalDateTime startTime);

    @Query("SELECT s FROM Slot s WHERE s.game.gameId = :gameId AND s.startTime >= :startTime AND s.startTime < :endTime ORDER BY s.startTime")
    List<Slot> findSlotsForDateRange(Long gameId, LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT s FROM Slot s WHERE s.game.gameId = :gameId AND s.startTime >= :start AND s.startTime <= :end")
    List<Slot> findUpcomingSlotsForToday( Long gameId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM Slot s WHERE s.startTime BETWEEN :now AND :future")
    List<Slot> findSlotsStartingInNext30Minutes(LocalDateTime now, LocalDateTime future);
}