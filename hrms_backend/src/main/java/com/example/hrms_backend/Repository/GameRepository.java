package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findAllByIsDeletedFalse();
}
