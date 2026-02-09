package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.ExpenseProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseProofRepository extends JpaRepository<ExpenseProof,Long> {
}
