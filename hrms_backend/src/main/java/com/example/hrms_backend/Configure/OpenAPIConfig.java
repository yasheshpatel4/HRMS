package com.example.hrms_backend.Configure;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

import static java.awt.SystemColor.info;

@Configuration
public class OpenAPIConfig {

    @Value("${swagger-server-description}")
    private String swaggerServerDescription;

    @Value("${swagger-server-url}")
    private String swaggerServerUrl;

    @Bean
    public OpenAPI openAPI() {

        Server server = new Server();
        server.setUrl(swaggerServerUrl);
        server.setDescription(swaggerServerDescription);

        return new OpenAPI().servers(List.of(server));
    }
}
