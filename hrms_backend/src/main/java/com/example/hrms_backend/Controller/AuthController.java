package com.example.hrms_backend.Controller;

import com.example.hrms_backend.DTO.UserDTO;
import com.example.hrms_backend.Entity.RefreshToken;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Service.JwtService;
import com.example.hrms_backend.Service.RefreshTokenService;
import com.example.hrms_backend.Service.userService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/Auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    @Autowired
    userService userservice;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO user, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
        );

        if (authentication.isAuthenticated()) {
            String accessToken = jwtService.generateToken(user.getEmail());
            User userEntity = userservice.findByEmail(user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userEntity);

            ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(15 * 60)
                    .sameSite("Strict")
                    .build();

            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
            response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

            return ResponseEntity.ok("Authentication successful");
        } else {
            throw new UsernameNotFoundException("Invalid user request!");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(name = "refreshToken") String refreshToken, HttpServletResponse response) {
        return refreshTokenService.findByToken(refreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtService.generateToken(user.getEmail());

                    ResponseCookie newAccessTokenCookie = ResponseCookie.from("accessToken", newAccessToken)
                            .httpOnly(true)
                            .secure(true)
                            .path("/")
                            .maxAge(15 * 60)
                            .sameSite("Strict")
                            .build();

                    response.addHeader(HttpHeaders.SET_COOKIE, newAccessTokenCookie.toString());
                    return ResponseEntity.ok("Token refreshed");
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserDTO userDto) {
        String result = userservice.addUser(userDto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }
}
