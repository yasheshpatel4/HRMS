package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShareRepository extends JpaRepository<Share,Long> {

    @Query("select s from Share s where s.job.jobId=:jobId")
    List<Share> findByJobId(Long jobId);

}
