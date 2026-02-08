package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.RefreshToken;
import com.example.hrms_backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);
}
