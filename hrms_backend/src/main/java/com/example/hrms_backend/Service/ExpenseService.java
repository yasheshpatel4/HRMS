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

    public String addExpense(Expense expense){
        expenseRepository.save(expense);
        return "successful";
    }
    public String deleteExpense(Expense expense){
        expenseRepository.delete(expense);
        return "delete successful";
    }


}
