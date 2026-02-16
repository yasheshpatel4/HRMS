package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.APIResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/openapi")
public class OpenAPIController
{

    @Value("${swagger-server-url}")
    private String swaggerServerUrl;

    @Value("${springdoc.swagger-ui.path}")
    private String swaggerUIPath;

    @GetMapping("/get")
    public ResponseEntity<APIResponse<String>> test() {
        APIResponse<String> apiResponse = new APIResponse<>(200, "API is Working!", swaggerServerUrl + swaggerUIPath + "/index.html");
        return new ResponseEntity<>(apiResponse, HttpStatus.ACCEPTED);
    }
}