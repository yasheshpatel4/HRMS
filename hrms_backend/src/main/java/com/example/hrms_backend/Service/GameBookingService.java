package com.example.hrms_backend.Service;
import com.example.hrms_backend.Entity.*;
import com.example.hrms_backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
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

    @Transactional
    public String processBooking(Long slotId, Long userId, Set<Long> participantIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        Game game = slot.getGame();

        boolean isInterested = user.getInterestedGames().stream()
                .anyMatch(g -> g.getGameId().equals(game.getGameId()));

        if (!isInterested) {
            return ("You must add " + game.getGameName() + " to your interested games first.");
        }

        if (bookingRepository.hasActiveBookingForGame(userId, game.getGameId())) {
            return ("You already have an active booking for " + game.getGameName());
        }
        int maxOtherEmployees = game.getConfiguration().getMaxPlayers()-1;
        if (participantIds.size() > maxOtherEmployees) {
            return ("Maximum " + maxOtherEmployees + " other employees can be added");
        }
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        int completedCount = bookingRepository.countCompletedSlotsByUserToday(
                userId,
                game.getGameId(),
                startOfDay,
                endOfDay
        );
//        int completedCount = bookingRepository.countCompletedSlotsByUser(userId, game.getGameId());
        Optional<Booking> activeBooking =
                bookingRepository.findBySlotAndStatus(slot, BookingStatus.ACTIVE);
        if (completedCount == 0 && activeBooking.isEmpty()) {

            assignSlot(user, slot,participantIds);
            return "SLOT_ASSIGNED_FIRST_TIME";
        }

        addToQueue(user, game, completedCount,participantIds);
        return "ADDED_TO_QUEUE";
    }
    private void assignSlot(User user, Slot slot,Set<Long> participantsIds) {

        Booking booking = new Booking();
        booking.setBookedBy(user);
        booking.setSlot(slot);
        booking.setBookedAt(LocalDateTime.now());
        booking.setStatus(BookingStatus.ACTIVE);
        booking.setParticipants(new HashSet<>(userRepository.findAllById(participantsIds)));

        bookingRepository.save(booking);

        slot.setAvailable(false);
        slotRepository.save(slot);

        emailService.sendEmail(
                user.getEmail(),
                "Slot Confirmed",
                "Your slot for " +slot.getGame().getGameName()+ " at " + slot.getStartTime() + " is confirmed."
        );
        for (User participant : booking.getParticipants()) {
            emailService.sendEmail(
                    participant.getEmail(),
                    "You are added to a Slot",
                    "you are added as participant by"+user.getName()
            );
        }
    }

    private void addToQueue(User user, Game game, int completedCount,Set<Long> participantIds) {

        if (fairnessQueueRepository.existsByUserAndGame(user, game))
            return;

        FairnessQueue queue = new FairnessQueue();
        queue.setUser(user);
        queue.setGame(game);
        queue.setSlotsPlayedCurrentCycle(completedCount);
        queue.setRequestTimestamp(LocalDateTime.now());
        queue.setParticipantIds(participantIds);
        fairnessQueueRepository.save(queue);
    }
    @Transactional
    @Scheduled(fixedRate = 60000)
    public void queueAssignmentEngine() {

        List<Slot> upcomingSlots =
                slotRepository.findSlotsStartingInNext30Minutes(
                        LocalDateTime.now(),
                        LocalDateTime.now().plusMinutes(30)
                );

        for (Slot slot : upcomingSlots) {

            Optional<Booking> activeBooking =
                    bookingRepository.findBySlotAndStatus(slot, BookingStatus.ACTIVE);
            if (activeBooking.isPresent())
                continue;
            assignFromQueue(slot);
        }
    }

    private void assignFromQueue(Slot slot) {

        List<FairnessQueue> queue = fairnessQueueRepository
                        .findByGameOrderBySlotsPlayedCurrentCycleAscRequestTimestampAsc(slot.getGame());

        if (queue.isEmpty())
            return;

        FairnessQueue top = queue.get(0);

        assignSlot(top.getUser(), slot,top.getParticipantIds());

        fairnessQueueRepository.delete(top);
    }

    public void cancelBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Slot slot = booking.getSlot();

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        slot.setAvailable(true);
        slotRepository.save(slot);

        long minutesRemaining =
                Duration.between(LocalDateTime.now(),
                        slot.getStartTime()).toMinutes();

        if (minutesRemaining <= 30) {
            assignFromQueue(slot);
        }
    }

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void autoCompleteBookings() {

        List<Booking> bookings =
                bookingRepository.findBookingsToAutoComplete(LocalDateTime.now());

        for (Booking booking : bookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }
    }
}
