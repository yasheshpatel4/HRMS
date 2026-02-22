package com.example.hrms_backend.Service;
import com.example.hrms_backend.Entity.Log;
import com.example.hrms_backend.Repository.LogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class LoggingService {

    @Autowired
    private LogRepository logRepository;

    @Async
    public void saveLog(String level, String message, String source, String details) {
        switch (level.toUpperCase()) {
            case "INFO" -> log.info("[{}] {}: {}", source, message, details);
            case "ERROR" -> log.error("[{}] {}: {}", source, message, details);
            case "WARN" -> log.warn("[{}] {}: {}", source, message, details);
        }

        Log logEntry = new Log();
        logEntry.setTimestamp(LocalDateTime.now());
        logEntry.setLevel(level);
        logEntry.setSource(source);
        logEntry.setMessage(message);
        logEntry.setDetails(details);
        logRepository.save(logEntry);
    }
}

