package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role,Long> {
}
