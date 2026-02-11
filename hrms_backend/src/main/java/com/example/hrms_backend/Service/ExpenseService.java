package com.example.hrms_backend.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hrms_backend.Entity.*;
import com.example.hrms_backend.Repository.ExpenseProofRepository;
import com.example.hrms_backend.Repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    ExpenseRepository expenseRepository;
    @Autowired
    Cloudinary cloudinary;
    @Autowired
    ExpenseProofRepository expenseProofRepository;

    public List<Expense> getAllByUserTravel(Long userId,Long travelId){
        return expenseRepository.findByUserTravel(userId,travelId);
    }

    public List<Expense> getAll() {
        return expenseRepository.findAll();
    }
    public Expense addExpense(Expense expense){
        return expenseRepository.save(expense);
    }
    public void deleteExpense(Long id){
        expenseRepository.deleteById(id);
    }

    public void approve(Long id) {
        expenseRepository.approve(id);
    }

    public ExpenseProof upload(Long expenseId, MultipartFile file) throws IOException {
        Expense expense=expenseRepository.findById(expenseId).orElseThrow(()->new RuntimeException("expense not found"));
        ExpenseProof expenseProof=new ExpenseProof();
        TravelDocument document = new TravelDocument();
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
}

