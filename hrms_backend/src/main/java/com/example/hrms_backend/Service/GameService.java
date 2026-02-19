package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Game;
import com.example.hrms_backend.Entity.GameConfiguration;
import com.example.hrms_backend.Entity.Slot;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.GameConfigurationRepository;
import com.example.hrms_backend.Repository.GameRepository;
import com.example.hrms_backend.Repository.SlotRepository;
import com.example.hrms_backend.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class GameService {

    @Autowired
    GameRepository gameRepository;
    @Autowired
    private GameConfigurationRepository gameConfigurationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private userService userService;
    @Autowired
    private SlotRepository slotRepository;

    public List<Game> getAllGames(){
        return gameRepository.findAll();
    }
    public Optional<Game> getGame(Long id){
        return gameRepository.findById(id);
    }
    public void deleteGame(Long id){
        gameRepository.deleteById(id);
    }

    public void createGame(Game game){
        gameRepository.save(game);
    }

    public GameConfiguration configureGameOperatingHours(Long gameId, LocalTime operatingHoursStart,
                                                         LocalTime operatingHoursEnd, int slotDurationMins,
                                                         int maxPlayers) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        GameConfiguration config = gameConfigurationRepository.findByGame(game)
                .orElse(new GameConfiguration());

        config.setGame(game);
        config.setOperatingHoursStart(operatingHoursStart);
        config.setOperatingHoursEnd(operatingHoursEnd);
        config.setSlotDurationMins(slotDurationMins);
        config.setMaxPlayers(maxPlayers);

        return gameConfigurationRepository.save(config);
    }

    public GameConfiguration getGameConfiguration(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        return gameConfigurationRepository.findByGame(game)
                .orElseThrow(() -> new RuntimeException("Configuration not found"));
    }

    public void addGameInterest(Long gameId) {
        User currentUser = userService.getCurrentUser();
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        currentUser.getInterestedGames().add(game);
        userRepository.save(currentUser);
    }
    public void removeGameInterest(Long gameId) {
        User currentUser = userService.getCurrentUser();
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        currentUser.getInterestedGames().remove(game);
        userRepository.save(currentUser);
    }
    public Set<User> getInterestedUsers(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        return game.getInterestedUsers();
    }

    public List<Slot> getAvailableSlots(Long gameId) {
        return slotRepository.findAvailableSlotsFrom(gameId, LocalDateTime.now());
    }
    public List<Slot> getAllSlotsForDate(Long gameId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        return slotRepository.findSlotsForDateRange(gameId, startOfDay, endOfDay);
    }
    public List<Slot> getTodayUpcoming(Long gameId) {
        return slotRepository.findUpcomingSlotsForToday(gameId, LocalDateTime.now(), LocalDate.now().atTime(23, 59));
    }

    @Transactional
    public void scheduleNextDayConfig(Long gameId, GameConfiguration newConfig) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        newConfig.setGame(game);
        gameConfigurationRepository.save(newConfig);
    }

    @Transactional
    public List<Slot> generateDailySlots(Long gameId, LocalDate date) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        GameConfiguration config = game.getConfiguration();

        List<Slot> slots = new ArrayList<>();
        LocalTime current = config.getOperatingHoursStart();

        while (current.plusMinutes(config.getSlotDurationMins()).isBefore(config.getOperatingHoursEnd()) ||
                current.plusMinutes(config.getSlotDurationMins()).equals(config.getOperatingHoursEnd())) {
            Slot slot = new Slot();
            slot.setGame(game);
            slot.setStartTime(date.atTime(current));
            slot.setEndTime(date.atTime(current.plusMinutes(config.getSlotDurationMins())));
            slot.setAvailable(true);
            slots.add(slot);
            current = current.plusMinutes(config.getSlotDurationMins());
        }
        return slotRepository.saveAll(slots);
    }
}
