package com.example.hrms_backend.Controller;
import com.example.hrms_backend.Entity.*;
import com.example.hrms_backend.Service.GameBookingService;
import com.example.hrms_backend.Service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/Game")
public class GameController {
    @Autowired
    GameService gameService;
    @Autowired
    GameBookingService gameBookingService;

    @GetMapping("/all")
    public ResponseEntity<List<Game>> getAllGame(){
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Game>> getGame(@PathVariable Long id){
        return ResponseEntity.ok(gameService.getGame(id));
    }
    @PostMapping("/create")
    public ResponseEntity<Game> createGame(@RequestParam String gameName) {
        return ResponseEntity.ok(gameService.createGame(gameName));
    }
    @DeleteMapping("/{id}")
    public void deleteGame(@PathVariable Long id){
        gameService.deleteGame(id);
    }

    @GetMapping("/{gameId}/configuration")
    public ResponseEntity<GameConfiguration> getGameConfiguration(@PathVariable Long gameId) {
        return ResponseEntity.ok(gameService.getGameConfiguration(gameId));
    }
    @PostMapping("/{gameId}/interest")
    public ResponseEntity<Void> addGameInterest(@PathVariable Long gameId) {
        gameService.addGameInterest(gameId);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{gameId}/interest")
    public ResponseEntity<Void> removeGameInterest(@PathVariable Long gameId) {
        gameService.removeGameInterest(gameId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/{gameId}/interested-users")
    public ResponseEntity<List<User>> getInterestedUsers(@PathVariable Long gameId) {
        return ResponseEntity.ok(gameService.getInterestedUsers(gameId).stream().toList());
    }
    @GetMapping("/{gameId}/slots/available")
    public ResponseEntity<List<Slot>> getAvailableSlots(@PathVariable Long gameId) {
        return ResponseEntity.ok(gameService.getAvailableSlots(gameId));
    }

    @GetMapping("/{gameId}/slots")
    public ResponseEntity<List<Slot>> getSlotsForDate(
            @PathVariable Long gameId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(gameService.getAllSlotsForDate(gameId, date));
    }

    @PostMapping("/generate-slots")
    public void generateSlots() {
        gameService.generateDailySlots();
    }
    @PutMapping("/booking/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) {
        gameBookingService.cancelBooking(bookingId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/booking/{bookingId}/complete")
    public ResponseEntity<Void> completeBooking(@PathVariable Long bookingId) {
        gameBookingService.completeBooking(bookingId);
        return ResponseEntity.ok().build();
    }

//    @PostMapping("/bookings/complete-expired")
//    public ResponseEntity<Void> completeExpiredBookings() {
//        gameBookingService.completeExpiredBookings();
//        return ResponseEntity.ok().build();
//    }

    @GetMapping("/booking/user")
    public ResponseEntity<Optional<List<Booking>>> getMyBookings() {
        return ResponseEntity.ok(gameBookingService.getUserBookings());
    }

    @GetMapping("/booking/upcoming")
    public ResponseEntity<List<Booking>> getUpcomingBookings() {
    return ResponseEntity.ok(gameBookingService.getUpcomingBookings());
    }

//    @GetMapping("/booking/game/{gameId}")
//    public ResponseEntity<List<Booking>> getBookingsForGame(@PathVariable Long gameId) {
//        return ResponseEntity.ok(gameBookingService.getBookingsForGame(gameId));
//    }

    @GetMapping("/{gameId}/slots/today")
    public ResponseEntity<List<Slot>> viewSlots(@PathVariable Long gameId) {
        return ResponseEntity.ok(gameService.getTodayUpcoming(gameId));
    }

    @PostMapping("/slots/{slotId}/book")
    public ResponseEntity<String> bookSlot(@PathVariable Long slotId,
                                           @RequestParam Long userId,
                                           @RequestBody Set<Long> participants) {
        return ResponseEntity.ok(gameBookingService.processBooking(slotId, userId, participants));
    }

    @PutMapping("/{gameId}/configure")
    public ResponseEntity<String> updateConfig(@PathVariable Long gameId, @ModelAttribute GameConfiguration config) {
        gameService.scheduleNextDayConfig(gameId, config);
        return ResponseEntity.ok("Configuration saved! Will apply to tomorrow's slots.");
    }

    @PostMapping("/add")
    public ResponseEntity<Void> addGame(@RequestBody Game game) {
        gameService.scheduleNextDayConfig(null, game.getConfiguration());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
