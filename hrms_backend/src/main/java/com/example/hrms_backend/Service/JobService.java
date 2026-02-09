package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Job;
import com.example.hrms_backend.Repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    JobRepository jobRepository;

    public List<Job> getAllJob() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJob(Long id) {
        return jobRepository.findById(id);
    }

    public void createJob(Job job) {
        jobRepository.save(job);
    }

    public Job updateJob(Job job) {
        return jobRepository.findById(job.getJobId())
                .map(job1 -> {
                    job1.setTitle(job.getTitle());
                    job1.setHrEmail(job.getHrEmail());
                    job1.setReviewerEmail(job.getReviewerEmail());
                    job1.setJdFilePath(job.getJdFilePath());
                    job1.setSummary(job.getSummary());
                    return jobRepository.save(job1);
                })
                .orElseThrow(() -> new RuntimeException("job not find"));

    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

}
