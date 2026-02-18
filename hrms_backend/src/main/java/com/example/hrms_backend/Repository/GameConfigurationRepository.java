package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.GameConfiguration;
import com.example.hrms_backend.Entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameConfigurationRepository extends JpaRepository<GameConfiguration, Long> {

    Optional<GameConfiguration> findByGame(Game game);

}
