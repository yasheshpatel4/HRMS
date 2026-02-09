package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job,Long> {

}
