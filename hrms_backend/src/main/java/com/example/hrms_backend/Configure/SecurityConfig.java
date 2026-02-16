package com.example.hrms_backend.Configure;

import com.example.hrms_backend.Filter.JwtAuthFilter;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;


    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;

    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/openapi/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/Auth/login","/Auth/logout", "/Auth/register", "/Auth/refresh","/Auth/me", "/error").permitAll()

                        .requestMatchers(HttpMethod.POST, "/Travel/add").hasAnyAuthority("HR","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/all").hasAnyAuthority("MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/{id}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/user/{id}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/HR/{id}").hasAnyAuthority("HR","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/Travel/{travelId}/upload").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")

                        .requestMatchers(HttpMethod.POST, "/Travel/Document/{travelId}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/Travel/Document/{travelId}/user/{userId}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/Travel/Document/{travelId}/manager/{managerId}").hasAnyAuthority("HR", "MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/Document/{docId}/url").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")

                        .requestMatchers(HttpMethod.POST, "/Travel/Expense/submit").hasAnyAuthority("EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/Travel/Expense/approve/{id}").hasAnyAuthority("HR","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/Expense/all").hasAnyAuthority("HR","EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/Expense/{userId}/{travelId}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/Expense/{travelId}").hasAnyAuthority("HR", "MANAGER", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/Travel/Expense/{expenseId}/upload-proof").hasAnyAuthority("EMPLOYEE","ADMIN","HR")
                        .requestMatchers(HttpMethod.GET, "/Travel/Expense/{expenseId}/proofs").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Travel/Expense/proof/{proofId}/url").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")

                        .requestMatchers(HttpMethod.GET, "/User/orgchart/{id}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")

                        .requestMatchers(HttpMethod.POST, "/Job/create").hasAnyAuthority("HR","ADMIN","MANAGER")
                        .requestMatchers(HttpMethod.GET, "/Job/all").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/Job/{jobId}/share").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/Job/{jobId}/refer").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Job/{jobId}/share").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Job/{jobId}/refer").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/Job/{jobId}").hasAnyAuthority("HR", "MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/Job/{jobId}").hasAnyAuthority("HR", "MANAGER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/Job/referral/{referralId}/status").hasAnyAuthority("HR", "MANAGER","ADMIN")


                        .requestMatchers(HttpMethod.POST, "/Post/create").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/Post/all").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/Post/{postId}/like").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/Post/{postId}/comment").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/Post/{postId}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")

                        .requestMatchers(HttpMethod.GET, "/Notification/{userId}").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/Notification/{notificationId}/read").hasAnyAuthority("HR", "MANAGER", "EMPLOYEE","ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
