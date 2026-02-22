package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Job;
import com.example.hrms_backend.Entity.Referral;
import com.example.hrms_backend.Entity.Share;
import com.example.hrms_backend.Service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
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

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable("id") Long id,
            @ModelAttribute Job job,
            @RequestParam(value = "reviewerEmails", required = false) List<String> reviewerEmails
    ) {
        job.setJobId(id);
        List<String> emails = (reviewerEmails == null) ? new ArrayList<>() : reviewerEmails;

        return ResponseEntity.ok(jobService.updateJob(job, emails));
    }

    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id){
        jobService.deleteJob(id);
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Job> createJob(@RequestParam("title") String title,
                                         @RequestParam("summary") String summary,
                                         @RequestParam("jdFile") MultipartFile jdFile,
                                         @RequestParam("hrEmail") String hrEmail,
                                         @RequestParam("reviewerEmails") List<String> reviewerEmails) throws IOException {
        Job job = new Job();
        job.setTitle(title);
        job.setSummary(summary);
        job.setHrEmail(hrEmail);
        return ResponseEntity.ok(jobService.createJob(job, jdFile, reviewerEmails));
    }

    @PostMapping("/{jobId}/share")
    public ResponseEntity<String> shareJob(@PathVariable Long jobId, @RequestBody List<String> recipientEmails) {
        jobService.shareJob(jobId, recipientEmails);
        return ResponseEntity.ok("Shared");
    }

    @PostMapping(value = "/{jobId}/refer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> referJob(@PathVariable Long jobId,
                                           @RequestParam("friendName") String friendName,
                                           @RequestParam("friendEmail") String friendEmail,
                                           @RequestParam("cv") MultipartFile cv,
                                           @RequestParam("note") String note) throws IOException {
        jobService.referJob(jobId, friendName, friendEmail, cv, note);
        return ResponseEntity.ok("referred successful");
    }

    @GetMapping("/{jobId}/shares")
    public ResponseEntity<List<Share>> getShares(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getSharesByJob(jobId));
    }

    @GetMapping("/{jobId}/refer")
    public ResponseEntity<List<Referral>> getReferrals(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getReferralsByJob(jobId));
    }

    @PutMapping("/referral/{referralId}/status")
    public ResponseEntity<Referral> updateReferralStatus(@PathVariable Long referralId, @RequestBody String newStatus) {
        return ResponseEntity.ok(jobService.updateReferralStatus(referralId, newStatus));
    }
    @GetMapping("/referrals")
    public ResponseEntity<List<Referral>> getMyReferrals() {
        return ResponseEntity.ok(jobService.getReferralsForCurrentUser());
    }
}
