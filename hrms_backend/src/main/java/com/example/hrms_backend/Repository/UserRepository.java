package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}