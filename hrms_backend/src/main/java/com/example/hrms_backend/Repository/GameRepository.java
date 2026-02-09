package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Long> {
}
