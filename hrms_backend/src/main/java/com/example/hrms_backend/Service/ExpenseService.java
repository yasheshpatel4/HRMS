package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Expense;
import com.example.hrms_backend.Repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    ExpenseRepository expenseRepository;

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
}
