package com.example.hrms_backend.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hrms_backend.Entity.*;
import com.example.hrms_backend.Repository.ExpenseProofRepository;
import com.example.hrms_backend.Repository.ExpenseRepository;
import com.example.hrms_backend.Repository.TravelRepository;
import com.example.hrms_backend.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

    @Autowired
    ExpenseRepository expenseRepository;
    @Autowired
    Cloudinary cloudinary;
    @Autowired
    ExpenseProofRepository expenseProofRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TravelRepository travelRepository;
    @Autowired
    NotificationService notificationService;
    @Autowired
    private EmailService emailService;

    public List<Expense> getAllByUserTravel(Long userId,Long travelId){
        return expenseRepository.findByUserTravel(userId,travelId);
    }

    public List<Expense> getAll() {
        return expenseRepository.findAll();
    }

    public Expense addExpense(Expense expense) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        expense.setUser(user);
        Travel travel = travelRepository.findById(expense.getTravel().getTravelId())
                .orElseThrow(() -> new RuntimeException("Travel not found"));
        expense.setTravel(travel);

        expense.setSubmittedAt(LocalDateTime.now());
        Expense savedExpense = expenseRepository.save(expense);

        User hr=travel.getCreatedBy();

        notificationService.createNotification(
                hr.getUserId(),
                "Expense",
                "New expense submitted by " + user.getName() +
                        " for travel: " + travel.getTitle());
        emailService.sendEmail(hr.getEmail(), "Expense Submitted for:"+travel.getTitle(),user.getName()+"has submitted the expense for the travel:"+travel.getTitle());
        return savedExpense;
}

    public void deleteExpense(Long id){
        expenseRepository.deleteById(id);
    }

    @Transactional
    public void approve(Long id) {
        String email=SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("user not found"));
        Expense expense=expenseRepository.findById(id).orElseThrow(()->new RuntimeException("Expense not found"));
        expense.setStatus("APPROVED");
        expense.setProcessedAt(LocalDateTime.now());
        expense.setProcessedBy(user);
        expenseRepository.save(expense);
    }

    public ExpenseProof upload(Long expenseId, MultipartFile file) throws IOException {
        Expense expense=expenseRepository.findById(expenseId).orElseThrow(()->new RuntimeException("expense not found"));
        ExpenseProof expenseProof=new ExpenseProof();
//        TravelDocument document = new TravelDocument();
        File convFile = new File(System.getProperty("java.io.tmpdir") + "/" + file.getOriginalFilename()+"_"+expense.getExpenseId());
        try {
            FileOutputStream fos = new FileOutputStream(convFile);
            fos.write(file.getBytes());
            fos.close();
            var result = cloudinary.uploader().upload(convFile, ObjectUtils.asMap("folder", "/Expenses/"));
            expenseProof.setProof(result.get("url").toString());
            expenseProof.setExpense(expense);
            return expenseProofRepository.save(expenseProof);
        }
        finally {
            if(convFile.exists()){
                convFile.delete();
            }
        }
    }

    public List<String> getProofByExpense(Long expenseId) {
        return expenseProofRepository.findByExpense(expenseId);
    }

    public String getProofById(Long proofId) {
        return expenseProofRepository.findProofUrl(proofId);
    }

    public Expense getByTravel(Long travelId) {

        return expenseRepository.findByTravel(travelId);
    }

    @Transactional
    public void reject(Long id) {
        String email=SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("user not found"));
        Expense expense=expenseRepository.findById(id).orElseThrow(()->new RuntimeException("Expense not found"));
        expense.setStatus("REJECTED");
        expense.setProcessedAt(LocalDateTime.now());
        expense.setProcessedBy(user);
        expenseRepository.save(expense);
    }
    public List<Expense> getExpensesByHRTravel(Long hrUserId) {
        return expenseRepository.findByTravelCreatedBy(hrUserId);
    }

//    public Double getTotalExpenseByUserAndTravel(Long userId, Long travelId) {
//        return expenseRepository.getTotalExpenseByUserAndTravel(userId, travelId);
//    }

    public boolean checkBudgetForExpense(Long userId, Long travelId, Double newAmount) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

        Double totalExpense = expenseRepository.getTotalExpenseByUserAndTravel(userId, travelId);
        Double newTotal = totalExpense + newAmount;

        return newTotal <= travel.getBudget();
    }

    public Map<String, Object> getBudgetInfo(Long userId, Long travelId) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

        Double totalExpense = expenseRepository.getTotalExpenseByUserAndTravel(userId, travelId);

        Map<String, Object> budgetInfo = new HashMap<>();
        budgetInfo.put("travelId", travelId);
        budgetInfo.put("budget", travel.getBudget());
        budgetInfo.put("totalExpense", totalExpense);
        budgetInfo.put("remainingBudget", travel.getBudget() - totalExpense);
        budgetInfo.put("canSubmit", (totalExpense < travel.getBudget()));

        return budgetInfo;
    }
}

