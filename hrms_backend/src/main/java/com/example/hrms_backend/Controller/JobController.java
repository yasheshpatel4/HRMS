package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Job;
import com.example.hrms_backend.Service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Job")
public class JobController {
    @Autowired
    JobService jobService;

    @GetMapping("/all")
    public ResponseEntity<List<Job>> getAllJob(){
        return ResponseEntity.ok(jobService.getAllJob());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Optional<Job>> getJob(@PathVariable Long id){
        return ResponseEntity.ok(jobService.getJob(id));
    }

    @PostMapping
    public ResponseEntity<Job> updateJob(@RequestBody Job job){
        return ResponseEntity.ok(jobService.updateJob(job));
    }
    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id){
        jobService.deleteJob(id);
    }
    @PostMapping("/add")
    public void addJob(@RequestBody Job job){
        jobService.createJob(job);
    }
}
