package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface JobRepository extends JpaRepository<Job,Long> {
    List<Job> findAllByIsDeletedFalse();

    @Query("SELECT j FROM Job j WHERE j.isDeleted = false AND " +
            "(LOWER(j.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(j.summary) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Job> searchJobs(String searchTerm);
}
