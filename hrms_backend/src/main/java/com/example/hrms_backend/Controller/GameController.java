package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Game;
import com.example.hrms_backend.Entity.Job;
import com.example.hrms_backend.Service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Game")
public class GameController {
    @Autowired
    GameService gameService;

    @GetMapping("/all")
    public ResponseEntity<List<Game>> getAllGame(){
        return ResponseEntity.ok(gameService.getAllGames());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Optional<Game>> getGame(@PathVariable Long id){
        return ResponseEntity.ok(gameService.getGame(id));
    }

    @PostMapping
    public ResponseEntity<Game> updateGame(@RequestBody Game game){
        return ResponseEntity.ok(gameService.upadateGame(game));
    }
    @DeleteMapping("/{id}")
    public void deleteGame(@PathVariable Long id){
        gameService.deleteGame(id);
    }
    @PostMapping("/add")
    public void addGame(@RequestBody Game game){
        gameService.createGame(game);
    }

}
