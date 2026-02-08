package com.example.hrms_backend.Controller;


import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private JwtService jwtService;

    private AuthenticationManager authenticationManager;


    @PostMapping("/generateToken")
    public String authenticateAndGetToken(@RequestBody User user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getName(), user.getPassword())
        );
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(user.getName());
        } else {
            throw new UsernameNotFoundException("Invalid user request!");
        }
    }
}
