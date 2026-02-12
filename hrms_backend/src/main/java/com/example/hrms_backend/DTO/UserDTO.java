package com.example.hrms_backend.DTO;

import com.example.hrms_backend.Entity.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserDTO {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private LocalDate dob;
    private LocalDate doj;
    private String department;
    private String designation;

    @Enumerated(EnumType.STRING)
    @NotBlank
    private Role role;

    @NotBlank
    private String managerEmail;

}
