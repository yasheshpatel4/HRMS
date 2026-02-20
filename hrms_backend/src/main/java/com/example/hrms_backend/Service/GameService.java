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
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found with ID: " + gameId));
        GameConfiguration existingConfig = gameConfigurationRepository.findByGame(game)
                .orElse(new GameConfiguration());

        existingConfig.setGame(game);
        existingConfig.setOperatingHoursStart(newConfig.getOperatingHoursStart());
        existingConfig.setOperatingHoursEnd(newConfig.getOperatingHoursEnd());
        existingConfig.setSlotDurationMins(newConfig.getSlotDurationMins());
        existingConfig.setMaxPlayers(newConfig.getMaxPlayers());
        gameConfigurationRepository.save(existingConfig);
    }

    @Transactional
    public void generateDailySlots() {
        LocalDate targetDate = LocalDate.now();
//        LocalDate targetDate = LocalDate.now().plusDays(1);
        List<Game> allGames = gameRepository.findAll();

        for (Game game : allGames) {
            GameConfiguration config = game.getConfiguration();
            if (config == null) continue;
            LocalDateTime startOfTargetDay = targetDate.atStartOfDay();
            LocalDateTime endOfTargetDay = targetDate.atTime(LocalTime.MAX);
            List<Slot> existing = slotRepository.findSlotsForDateRange(game.getGameId(), startOfTargetDay, endOfTargetDay);

            if (!existing.isEmpty()) continue;

            List<Slot> slots = new ArrayList<>();
            LocalTime current = config.getOperatingHoursStart();
            LocalTime end = config.getOperatingHoursEnd();

            while (!current.plusMinutes(config.getSlotDurationMins()).isAfter(end)) {
                Slot slot = new Slot();
                slot.setGame(game);
                slot.setStartTime(targetDate.atTime(current));

                LocalTime nextTime = current.plusMinutes(config.getSlotDurationMins());
                slot.setEndTime(targetDate.atTime(nextTime));
                slot.setAvailable(true);
                slots.add(slot);
                current = nextTime;
            }
            slotRepository.saveAll(slots);
        }
    }

    public Game createGame(String name) {
        Game game = new Game();
        game.setGameName(name);
        return gameRepository.save(game);
    }
}
