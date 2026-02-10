package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Travel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendTravelNotification(@Email @NotBlank String email, Travel savedTravel) {

    }
}
