package com.example.hrms_backend.Service;

import com.example.hrms_backend.DTO.UserDTO;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class userService implements UserDetailsService {

    @Autowired
    public  UserRepository userRepository;
    @Autowired
    public PasswordEncoder passwordEncoder;

    public User findByEmail(@Email @NotBlank String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return user.get();
        } else {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return findByEmail(username);
    }

    public String addUser(UserDTO user) {
        User user1=new User();
        user1.setEmail(user.getEmail());
        user1.setName(user.getName());
        user1.setPassword(passwordEncoder.encode(user.getPassword()));
        user1.setDob(user.getDob());
        user1.setDoj(user.getDoj());
        user1.setDesignation(user.getDesignation());
        user1.setDepartment(user.getDepartment());
        user1.setRole(user.getRole());
        userRepository.save(user1);
        return "successful";
    }
    public List<User> getAll(){
        return userRepository.findAll();
    }
}

