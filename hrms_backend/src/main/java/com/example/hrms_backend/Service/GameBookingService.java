package com.example.hrms_backend.Service;
import com.example.hrms_backend.Entity.*;
import com.example.hrms_backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
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
    @Autowired
    GameRepository gameRepository;
    @Autowired
    FairnessQueueRepository fairnessQueueRepository;
    @Autowired
    private EmailService emailService;

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        User currentUser = userService.getCurrentUser();
        emailService.sendEmail(currentUser.getEmail(),
                "slot cancelled",
                "your booked slot is cancelled " +
                        "due to some other person who has higher priority try to book the same slot as you");

        if (!booking.getBookedBy().equals(currentUser)) {
            throw new RuntimeException("You can only cancel your own booking");
        }

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active");
        }

        Slot slot = booking.getSlot();
        slot.setAvailable(true);
        slotRepository.save(slot);
//        updateQueue(currentUser, slot.getGame(), );
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

        if (LocalDateTime.now().isBefore(slot.getStartTime())) {
            throw new RuntimeException("Cannot complete booking before slot end time");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);
    }

    public Optional<List<Booking>> getUserBookings() {
        User currentUser = userService.getCurrentUser();
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return bookingRepository.findActiveBookingForUserOnDate(currentUser.getUserId(),start,end);
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
    @Transactional
    public String processBooking(Long slotId, Long requesterId, Set<Long> participantIds) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        Game game = slot.getGame();

        boolean isInterested = requester.getInterestedGames().stream()
                .anyMatch(g -> g.getGameId().equals(game.getGameId()));

        if (!isInterested) {
            throw new RuntimeException("You must add " + game.getGameName() + " to your interested games first.");
        }

        if (bookingRepository.hasActiveBookingForGame(requesterId, game.getGameId())) {
            throw new RuntimeException("You already have an active booking for " + game.getGameName());
        }

        int requesterPlayedCount = bookingRepository.countActiveSlotsByUserId(requesterId,game.getGameId());
        Optional<Booking> currentBooking = bookingRepository.findBySlotAndStatus(slot, BookingStatus.ACTIVE);

        int maxOtherEmployees = game.getConfiguration().getMaxPlayers();
        if (participantIds.size() > maxOtherEmployees) {
            throw new RuntimeException("Maximum " + maxOtherEmployees + " other employees can be added");
        }

        if (currentBooking.isEmpty()) {
            createBooking(slot, requester, participantIds);
            for(Long id:participantIds){
                User participant=userRepository.findById(id).orElseThrow(()->new RuntimeException("participantsId is not matching"));
                emailService.sendEmail(participant.getEmail(),"Added into participants for slot","you are added into slot"+slot.getStartTime()+"by the :"+requester.getName());
            }
            updateQueue(requester, slot.getGame(), requesterPlayedCount + 1);
            return "SUCCESS_BOOKED";
        }

        User existingUser = currentBooking.get().getBookedBy();
        int existingPlayedCount = bookingRepository.countActiveSlotsByUserId(existingUser.getUserId(),game.getGameId());

        if (requesterPlayedCount < existingPlayedCount) {
            currentBooking.get().setStatus(BookingStatus.CANCELLED);
            createBooking(slot, requester, participantIds);
            updateQueue(requester, game, requesterPlayedCount + 1);
            updateQueue(existingUser, game, Math.max(0, existingPlayedCount - 1));
            return "SUCCESS_DISPLACED";
        } else {
            updateQueue(requester, game, requesterPlayedCount);
            return "FAILED_LOWER_PRIORITY";
        }
    }

    private void createBooking(Slot slot, User user, Set<Long> pIds) {
        Booking booking = new Booking();
        booking.setSlot(slot);
        booking.setBookedBy(user);
        booking.setBookedAt(LocalDateTime.now());
        booking.setParticipants(new HashSet<>(userRepository.findAllById(pIds)));
        bookingRepository.save(booking);

        slot.setAvailable(false);
        slotRepository.save(slot);
    }

    private void updateQueue(User user, Game game, int newCount) {
        FairnessQueue entry = fairnessQueueRepository.findByUserAndGame(user, game)
                .orElse(new FairnessQueue());
        entry.setUser(user);
        entry.setGame(game);
        entry.setSlotsPlayedCurrentCycle(newCount);
        entry.setRequestTimestamp(LocalDateTime.now());
        fairnessQueueRepository.save(entry);
    }
}
