package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.ExpenseProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseProofRepository extends JpaRepository<ExpenseProof,Long> {
    @Query("select ep.proof from ExpenseProof ep where ep.expense.expenseId=:expenseId")
    List<String> findByExpense(Long expenseId);

    @Query("select ep.proof from ExpenseProof ep where ep.proofId=:proofId")
    String findProofUrl(Long proofId);
}
