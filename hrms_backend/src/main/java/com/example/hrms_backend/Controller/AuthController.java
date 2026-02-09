package com.example.hrms_backend.Controller;

import com.example.hrms_backend.DTO.UserDTO;
import com.example.hrms_backend.Entity.RefreshToken;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Service.JwtService;
import com.example.hrms_backend.Service.RefreshTokenService;
import com.example.hrms_backend.Service.userService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    @Autowired
    userService userservice;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> authenticateAndGetToken(@RequestBody UserDTO user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
        );
        if (authentication.isAuthenticated()) {
            String accessToken = jwtService.generateToken(user.getEmail());
            User userEntity = userservice.findByEmail(user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userEntity);
            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken.getToken());
            return ResponseEntity.ok(tokens);
        } else {
            throw new UsernameNotFoundException("Invalid user request!");
        }
    }
    @PostMapping("/register") // 2. Create the register endpoint
    public ResponseEntity<String> register(@RequestBody UserDTO userDto) {
        String result = userservice.addUser(userDto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        return refreshTokenService.findByToken(refreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtService.generateToken(user.getEmail());
                    Map<String, String> tokens = new HashMap<>();
                    tokens.put("accessToken", accessToken);
                    return ResponseEntity.ok(tokens);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
    @GetMapping("/welcome")
    public ResponseEntity<String> welcome(){
                return new ResponseEntity<>("successful", HttpStatus.ACCEPTED);
    }

}
