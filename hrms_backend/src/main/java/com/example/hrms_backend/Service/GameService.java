package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Game;
import com.example.hrms_backend.Entity.GameConfiguration;
import com.example.hrms_backend.Entity.Slot;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.GameConfigurationRepository;
import com.example.hrms_backend.Repository.GameRepository;
import com.example.hrms_backend.Repository.SlotRepository;
import com.example.hrms_backend.Repository.UserRepository;
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
    public List<Slot> generateDailySlots(Long gameId, LocalDate date) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        GameConfiguration config = gameConfigurationRepository.findByGame(game)
                .orElseThrow(() -> new RuntimeException("Configuration not found"));

        List<Slot> generatedSlots = new ArrayList<>();
        LocalDateTime currentDateTime = LocalDateTime.of(date, config.getOperatingHoursStart());
        LocalDateTime endDateTime = LocalDateTime.of(date, config.getOperatingHoursEnd());

        while (currentDateTime.plusMinutes(config.getSlotDurationMins()).isBefore(endDateTime) ||
                currentDateTime.plusMinutes(config.getSlotDurationMins()).isEqual(endDateTime)) {
            Slot slot = new Slot();
            slot.setGame(game);
            slot.setStartTime(currentDateTime);
            slot.setEndTime(currentDateTime.plusMinutes(config.getSlotDurationMins()));
            slot.setAvailable(true);
            generatedSlots.add(slot);
            currentDateTime = currentDateTime.plusMinutes(config.getSlotDurationMins());
        }

        return slotRepository.saveAll(generatedSlots);
    }
}
