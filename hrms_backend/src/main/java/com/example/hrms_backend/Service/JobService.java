package com.example.hrms_backend.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hrms_backend.Entity.*;
import com.example.hrms_backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    JobRepository jobRepository;
    @Autowired
    ShareRepository shareRepository;
    @Autowired
    ReferralRepository referralRepository;
    @Autowired
    UserRepository userRepository;

    @Autowired
    NotificationService notificationService;

    @Autowired
    EmailService emailService;

    @Autowired
    private Cloudinary cloudinary;

    public List<Job> getAllJob() {
        return jobRepository.findAll();
    }

//    public Optional<Job> getJob(Long id) {
//        return jobRepository.findById(id);
//    }

    public Job createJob(Job job, MultipartFile jdFile, List<String> reviewerEmails) throws IOException {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        File convFile = new File(System.getProperty("java.io.tmpdir") + "/" + jdFile.getOriginalFilename() + "_" + System.currentTimeMillis());
        FileOutputStream fos = new FileOutputStream(convFile);
        fos.write(jdFile.getBytes());
        fos.close();
        var uploadResult = cloudinary.uploader().upload(convFile, ObjectUtils.asMap("folder", "/JobDescriptions/"));

        if (uploadResult != null && uploadResult.containsKey("url")) {
            job.setJdFilePath(uploadResult.get("url").toString());
        } else {
            throw new RuntimeException("Cloudinary upload failed: " + uploadResult);
        }

        Set<User> reviewers = new HashSet<>();
        for (String email : reviewerEmails) {
            User reviewer = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Reviewer not found: " + email));
            reviewers.add(reviewer);
        }
        job.setReviewers(reviewers);

        return jobRepository.save(job);
    }

    public Job updateJob(Job job, List<String> reviewerEmails) {
        return jobRepository.findById(job.getJobId())
                .map(job1 -> {
                    job1.setTitle(job.getTitle());
                    job1.setHrEmail(job.getHrEmail());
                    Set<User> reviewers = new HashSet<>();
                    for (String email : reviewerEmails) {
                        User reviewer = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Reviewer not found: " + email));
                        reviewers.add(reviewer);
                    }
                    job1.setReviewers(reviewers);
                    job1.setJdFilePath(job.getJdFilePath());
                    job1.setSummary(job.getSummary());
                    return jobRepository.save(job1);
                })
                .orElseThrow(() -> new RuntimeException("job not find"));

    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    public void shareJob(Long jobId, List<String> recipientEmails) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Share share =new Share();
        share.setJob(job);
        share.setSharedBy(currentUser);
        share.setSharedAt(LocalDateTime.now());

        Set<Recipient> recipients = recipientEmails.stream()
                .map(email -> {
                    Recipient recipient = new Recipient();
                    recipient.setEmail(email);
                    recipient.setShare(share);
                    return recipient;
                })
                .collect(Collectors.toSet());

        share.setRecipients(recipients);
        shareRepository.save(share);

        for (String email : recipientEmails) {
            emailService.sendJobShareNotification(email, job);
        }
    }

    public void referJob(Long jobId, String friendName, String friendEmail, MultipartFile cv, String note) throws IOException {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        File convFile = new File(System.getProperty("java.io.tmpdir") + "/" + cv.getOriginalFilename() + "_" + System.currentTimeMillis());
        try {
            FileOutputStream fos = new FileOutputStream(convFile);
            fos.write(cv.getBytes());
            fos.close();
            var uploadResult = cloudinary.uploader().upload(convFile, ObjectUtils.asMap("folder", "/CVs/","resource_type", "auto"));

            Referral referral = new Referral();
            referral.setJob(job);
            referral.setReferrer(currentUser);
            referral.setFriendName(friendName);
            referral.setFriendEmail(friendEmail);
            if (uploadResult != null && uploadResult.containsKey("url")) {
                referral.setCvFilePath(uploadResult.get("url").toString());
            } else {
                throw new RuntimeException("Cloudinary upload failed: " + uploadResult);
            }
            referral.setStatus("Pending");
            referral.setNote(note);
            referral.setCreatedAt(LocalDateTime.now());

            referralRepository.save(referral);

            for (User reviewer : job.getReviewers()) {
                emailService.sendJobReferNotification(reviewer.getEmail(), job);
            }
        }
        finally {
            if(convFile.exists()){
                convFile.delete();
            }
        }
    }

    public List<Share> getSharesByJob(Long jobId) {
        return shareRepository.findByJobId(jobId);
    }

    public List<Referral> getReferralsByJob(Long jobId) {
        return referralRepository.findByJobId(jobId);
    }

    public Referral updateReferralStatus(Long referralId, String newStatus) {
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new RuntimeException("Referral not found"));
        referral.setStatus(newStatus);
        return referralRepository.save(referral);
    }

}
