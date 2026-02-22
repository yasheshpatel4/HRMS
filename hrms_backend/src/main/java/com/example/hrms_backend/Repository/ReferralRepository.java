package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralRepository extends JpaRepository<Referral,Long> {

    @Query("select r from Referral r where r.job.jobId=:jobId")
    List<Referral> findByJobId(Long jobId);
    List<Referral> findByReferrerUserId(Long userId);
    List<Referral> findByJobJobId(Long jobId);
}
