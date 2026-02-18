package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Expense;
import com.example.hrms_backend.Entity.ExpenseProof;
import com.example.hrms_backend.Entity.Travel;
import com.example.hrms_backend.Entity.TravelDocument;
import com.example.hrms_backend.Repository.TravelRepository;
import com.example.hrms_backend.Service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/Travel/Expense")
public class ExpenseController {

    @Autowired
    ExpenseService expenseService;
    @Autowired
    TravelRepository travelRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Expense>> getAll(){
        return ResponseEntity.ok(expenseService.getAll());
    }

    @GetMapping("/{travelId}")
    public ResponseEntity<Expense> getByTravel(@PathVariable Long travelId){
        return ResponseEntity.ok(expenseService.getByTravel(travelId));
    }
    @GetMapping("/{userId}/{travelId}")
    public ResponseEntity<List<Expense>> getByUserTravel(@PathVariable Long userId,@PathVariable Long travelId){
        List<Expense> expenses = expenseService.getAllByUserTravel(userId, travelId);

        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(expenses);
    }
    @DeleteMapping("/delete/{id}")
    public void deleteExpense(@PathVariable Long id){
        expenseService.deleteExpense(id);
    }
    @PostMapping("/submit")
    public ResponseEntity<Expense> addExpense(
            @RequestParam Double amount,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam Long travelId
    ) {
        Expense expense = new Expense();
        expense.setAmount(amount);
        expense.setCategory(category);
        expense.setDescription(description);

        Travel travel=travelRepository.findById(travelId).orElseThrow(()->new RuntimeException("not found"));
        expense.setTravel(travel);
        return ResponseEntity.ok(expenseService.addExpense(expense));
    }

    @PutMapping("/approve/{id}")
    public void setApproveBy(@PathVariable Long id){
        expenseService.approve(id);
    }

    @PutMapping("/reject/{id}")
    public void setRejectBy(@PathVariable Long id){
        expenseService.reject(id);
    }

    @PostMapping("/{expenseId}/upload-proof")
    public ResponseEntity<ExpenseProof> upload(@PathVariable Long expenseId,
                               @RequestParam("file") MultipartFile file) throws IOException{
        return ResponseEntity.ok(expenseService.upload(expenseId,file));
    }

    @GetMapping("/{expenseId}/proofs")
    public ResponseEntity<List<String>> getProofByExpense(@PathVariable Long expenseId){
        return ResponseEntity.ok(expenseService.getProofByExpense(expenseId));
    }

    @GetMapping("/proof/{proofId}/url")
    public ResponseEntity<String> getProofById(@PathVariable Long proofId){
        return ResponseEntity.ok(expenseService.getProofById(proofId));
    }

}
