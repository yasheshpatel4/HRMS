package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Game;
import com.example.hrms_backend.Repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GameService {

    @Autowired
    GameRepository gameRepository;

    public List<Game> getAllGames(){
        return gameRepository.findAll();
    }
    public Optional<Game> getGame(Long id){
        return gameRepository.findById(id);
    }
    public void deleteGame(Long id){
        gameRepository.deleteById(id);
    }

    public Game upadateGame(Game game){
        return gameRepository.findById(game.getGameId())
                .map(game1 -> {
                    game1.setGameName(game.getGameName());
                    game1.setMaxPlayers(game.getMaxPlayers());
                    game1.setSlot(game.getSlot());
                    return gameRepository.save(game1);
                })
                .orElseThrow(() -> new RuntimeException("Travel record not found"));
    }
    public void createGame(Game game){
        gameRepository.save(game);
    }

}
