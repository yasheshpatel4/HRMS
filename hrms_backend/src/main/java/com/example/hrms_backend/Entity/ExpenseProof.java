package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class ExpenseProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long proofId;

    @ManyToOne
    @JsonBackReference
    private Expense expense;

    @NotBlank
    private String proof;
}
