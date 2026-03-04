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

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

    @NotBlank
    private String status = "PENDING";

    @ManyToOne
    private User processedBy;

    private LocalDateTime processedAt;

    private String remarks;

    private LocalDateTime submittedAt;
    private LocalDate date;

    private Boolean isDeleted = Boolean.FALSE;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ExpenseProof> proofs = new ArrayList<>();
}