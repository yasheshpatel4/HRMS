package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Expense;
import com.example.hrms_backend.Service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/Travel/Expense")
public class ExpenseController {

    @Autowired
    ExpenseService expenseService;

    @GetMapping("/all")
    public ResponseEntity<List<Expense>> getAll(){
        return ResponseEntity.ok(expenseService.getAll());
    }

    @GetMapping("/{userId}/{travelId}")
    public ResponseEntity<List<Expense>> getByUserTravel(@PathVariable Long userId,@PathVariable Long travelId){
        List<Expense> expenses = expenseService.getAllByUserTravel(userId, travelId);

        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(expenses);
    }



}
