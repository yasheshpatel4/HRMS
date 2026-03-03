package com.example.hrms_backend.Controller;

import com.example.hrms_backend.DTO.ResetRequest;
import com.example.hrms_backend.DTO.UserDTO;
import com.example.hrms_backend.Entity.RefreshToken;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Service.JwtService;
import com.example.hrms_backend.Service.RefreshTokenService;
import com.example.hrms_backend.Service.userService;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
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

    private static final String SECRET_KEY = "MySecretKey12345"; 

    private String decryptPassword(String encryptedData) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "AES");
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, keySpec);
        byte[] decoded = Base64.getDecoder().decode(encryptedData);
        byte[] decrypted = cipher.doFinal(decoded);
        return new String(decrypted, StandardCharsets.UTF_8);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO user, HttpServletResponse response) {
        String decryptedPassword;
        try {
            decryptedPassword = decryptPassword(user.getPassword());
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt password", e);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), decryptedPassword)
        );



        if (authentication.isAuthenticated()) {
            String accessToken = jwtService.generateToken(user.getEmail());
            User userEntity = userservice.findByEmail(user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userEntity);

            ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(60 * 60)
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
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Authentication successful");
            responseBody.put("role", userEntity.getRole().toString());
            responseBody.put("name",userEntity.getName());

            return ResponseEntity.ok(responseBody);
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

                    ResponseCookie AccessTokenCookie = ResponseCookie.from("accessToken", newAccessToken)
                            .httpOnly(true)
                            .secure(true)
                            .path("/")
                            .maxAge(60 * 1)
                            .sameSite("Strict")
                            .build();

                    response.addHeader(HttpHeaders.SET_COOKIE, AccessTokenCookie.toString());
                    return ResponseEntity.ok("Token refreshed");
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        return ResponseEntity.ok(userservice.getCurrentUser());
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserDTO userDto) {
        try {
            String decryptedPassword = decryptPassword(userDto.getPassword());
            userDto.setPassword(decryptedPassword);

            return new ResponseEntity<>(userservice.addUser(userDto), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Registration failed: Invalid password encryption", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        if (refreshToken != null) {
            refreshTokenService.deleteByToken(refreshToken);
        }
        ResponseCookie cleanAccessTokenCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        ResponseCookie cleanRefreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cleanAccessTokenCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cleanRefreshTokenCookie.toString());

        return ResponseEntity.ok("Logged out successfully");
    }
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        userservice.sendOtp(email);
        return ResponseEntity.ok("OTP sent to your email.");
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetRequest req) {
        try {
            String plainPassword = decryptPassword(req.getPassword());
            userservice.verifyAndReset(req.getEmail(), req.getOtp(), plainPassword);
            return ResponseEntity.ok("Password reset successful.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Decryption or Reset failed");
        }
    }

}
