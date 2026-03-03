package com.example.hrms_backend.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hrms_backend.DTO.UserDTO;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.ExceptionHandler.ResourceNotFoundException;
import com.example.hrms_backend.Repository.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class userService implements UserDetailsService {

    @Autowired
    public  UserRepository userRepository;
    @Autowired
    public PasswordEncoder passwordEncoder;
    @Autowired
    ModelMapper modelmapper;
    @Autowired
    Cloudinary cloudinary;
    @Autowired
    EmailService emailService;
    private final Map<String, String> otpCache = new ConcurrentHashMap<>();

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException( "User not found"));
        return currentUser;
    }

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
        String email= user.getManagerEmail();
        User manager=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("user who try to register other user is not login"));
        user1.setManager(manager);
//        User user1=modelmapper.map(user,User.class);
        userRepository.save(user1);
        return "successful";
    }
    public List<User> getAll(){
        return userRepository.findAll();
    }

    public List<User> getOrgChart(Long id) {
        List<User> userlist = new ArrayList<>();

        while (id != null) {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) break;

            userlist.add(user);
            id=(user.getManager()!=null)?user.getManager().getUserId():null;
        }
        return userlist;
    }
    public Page<User> getAllUsers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.isEmpty()) {
            return userRepository.findByNameContainingIgnoreCase(search, pageable);
        }
        return userRepository.findAll(pageable);
    }

    public String updateProfilePhoto(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        File convFile = new File(System.getProperty("java.io.tmpdir") + "/" +
                System.currentTimeMillis() + "_" + file.getOriginalFilename());

        try (FileOutputStream fos = new FileOutputStream(convFile)) {
            fos.write(file.getBytes());

            var result = cloudinary.uploader().upload(convFile,
                    ObjectUtils.asMap("folder", "Profiles/"));

            if (result != null && result.containsKey("url")) {
                String photoUrl = result.get("url").toString();
                user.setProfilePhoto(photoUrl);
                userRepository.save(user);
                return photoUrl;
            } else {
                throw new RuntimeException("Cloudinary upload failed");
            }
        } finally {
            if (convFile.exists()) {
                convFile.delete();
            }
        }
    }
    public List<User> getAllHR() {
        return userRepository.findByRoleHR();
    }

    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SecureRandom secureRandom = new SecureRandom();
        int otpNumber = secureRandom.nextInt(1000000);
        String otp = String.format("%06d", otpNumber);

        otpCache.put(email, otp);

        new Timer().schedule(new TimerTask() {
            @Override
            public void run() { otpCache.remove(email); }
        }, 5 * 60 * 1000);

        emailService.sendEmail(email, "Your Password Reset OTP", "Your OTP is: " + otp);
    }

    public void verifyAndReset(String email, String otp, String newPassword) {
        if (!otp.equals(otpCache.get(email))) throw new RuntimeException("Invalid or expired OTP");

        User user = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("user not found with email"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpCache.remove(email);
    }

}

