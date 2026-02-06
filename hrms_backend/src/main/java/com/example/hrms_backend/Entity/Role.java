package com.example.hrms_backend.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roleId;

    @NotBlank
    @Column(unique = true)
    private String roleName;

    @ManyToMany(mappedBy = "roles")
    @JsonBackReference
    private Set<User> users = new HashSet<>();
}
