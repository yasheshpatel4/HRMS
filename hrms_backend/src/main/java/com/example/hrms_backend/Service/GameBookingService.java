package com.example.hrms_backend.Service;
import com.example.hrms_backend.Entity.*;
import com.example.hrms_backend.Repository.BookingRepository;
import com.example.hrms_backend.Repository.GameConfigurationRepository;
import com.example.hrms_backend.Repository.SlotRepository;
import com.example.hrms_backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class GameBookingService {
    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    SlotRepository slotRepository;
    @Autowired
    userService userService;
    @Autowired
    GameConfigurationRepository gameConfigurationRepository;

    @Transactional
    public Booking bookSlot(Long slotId, List<Long> participantIds) {
        User currentUser = userService.getCurrentUser();

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.isAvailable()) {
            throw new RuntimeException("Slot is not available");
        }

        Game game = slot.getGame();
        GameConfiguration config = gameConfigurationRepository.findByGame(game)
                .orElseThrow(() -> new RuntimeException("Game configuration not found"));

        LocalDateTime startOfDay = slot.getStartTime().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = slot.getStartTime().toLocalDate().atTime(23, 59, 59);

        if (bookingRepository.findActiveBookingForUserOnDate(currentUser.getUserId(), startOfDay, endOfDay).isPresent()) {
            throw new RuntimeException("You already have an active booking for this day");
        }
        for (Long participantId : participantIds) {
            if (bookingRepository.findActiveBookingForUserOnDate(participantId, startOfDay, endOfDay).isPresent()) {
                throw new RuntimeException("One of the participants already has an active booking for this day");
            }
        }

        Set<User> participants = new HashSet<>();
        for (Long participantId : participantIds) {
            User participant = userRepository.findById(participantId)
                    .orElseThrow(() -> new RuntimeException("Participant with ID " + participantId + " not found"));
            participants.add(participant);
        }

        int maxOtherEmployees = config.getMaxPlayers() - 1;
        if (participants.size() > maxOtherEmployees) {
            throw new RuntimeException("Maximum " + maxOtherEmployees + " other employees can be added");
        }

        Booking booking = new Booking();
        booking.setSlot(slot);
        booking.setBookedBy(currentUser);
        booking.setBookedAt(LocalDateTime.now());
        booking.setStatus(BookingStatus.ACTIVE);
        booking.setParticipants(participants);

        slot.setAvailable(false);
        slotRepository.save(slot);

        return bookingRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        User currentUser = userService.getCurrentUser();

        if (!booking.getBookedBy().equals(currentUser)) {
            throw new RuntimeException("You can only cancel your own booking");
        }

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active");
        }

        Slot slot = booking.getSlot();
        slot.setAvailable(true);
        slotRepository.save(slot);

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);


    }

    @Transactional
    public void completeBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is already " + booking.getStatus());
        }
        Slot slot = booking.getSlot();

        if (LocalDateTime.now().isBefore(slot.getEndTime())) {
            throw new RuntimeException("Cannot complete booking before slot end time");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);


    }

    public List<Booking> getUserBookings() {
        User currentUser = userService.getCurrentUser();
        return bookingRepository.findByBookedByAndStatus(currentUser.getUserId(), BookingStatus.ACTIVE);
    }

    public List<Booking> getUpcomingBookings() {
        return bookingRepository.findUpcomingActiveBookings(LocalDateTime.now());
    }

    public List<Booking> getBookingsForGame(Long gameId) {
        return bookingRepository.findUpcomingActiveBookingsByGame(gameId, LocalDateTime.now());
    }
    @Transactional
    public void completeExpiredBookings() {
        List<Booking> expiredBookings = bookingRepository.findByStatusAndSlotEndTimeBefore(
                BookingStatus.ACTIVE, LocalDateTime.now());
        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);

        }
    }

}
