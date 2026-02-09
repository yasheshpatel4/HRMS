package com.example.hrms_backend.Controller;

import com.example.hrms_backend.DTO.UserDTO;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Service.userService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/User")
public class UserController {

    @Autowired
    userService userservice;

    @GetMapping("/all")
    public ResponseEntity<List<User>> getALL(){
        return ResponseEntity.ok(userservice.getAll());
    }
}
