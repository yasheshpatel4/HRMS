package com.example.hrms_backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;
import lombok.*;
import java.time.*;
import java.util.*;

@Entity
@Getter @Setter
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long expenseId;

    @ManyToOne
    private Travel travel;

    @ManyToOne
    private User user;

    @Positive
    private Double amount;

    @NotBlank
    private String category;

    private String description;

    @NotBlank
    private String status = "PENDING";

    @ManyToOne
    private User processedBy;

    private LocalDateTime processedAt;

    private String remarks;

    private LocalDateTime submittedAt;

    private Boolean isDeleted = Boolean.FALSE;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ExpenseProof> proofs = new ArrayList<>();
}