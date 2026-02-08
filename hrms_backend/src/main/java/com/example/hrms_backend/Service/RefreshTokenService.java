package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.RefreshToken;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(1000 * 60 * 60 * 24 * 7)); // 7 days
        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public void deleteByUser(User user) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByUser(user);
        refreshToken.ifPresent(refreshTokenRepository::delete);
    }
}
