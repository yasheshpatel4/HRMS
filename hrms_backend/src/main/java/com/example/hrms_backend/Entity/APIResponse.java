package com.example.hrms_backend.Entity;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class APIResponse<T> {
    private int code;
    private String message;
    private T data;
}