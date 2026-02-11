package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Travel;
import com.example.hrms_backend.Entity.TravelDocument;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Service.TravelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Travel")
public class TravelController {

    @Autowired
    TravelService travelService;

    @GetMapping("/all")
    public ResponseEntity<List<Travel>> getAll(){
        return new ResponseEntity<>(travelService.getAllTravel(), HttpStatus.ACCEPTED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Travel>> getByID(@PathVariable long id) {
        return ResponseEntity.ok(travelService.getTravelById(id));
    }

    @PostMapping("/add")
    public ResponseEntity<Travel> addTravel(@RequestBody Travel travel){
        return ResponseEntity.ok(travelService.createTravel(travel));
    }


    @GetMapping("/user/{id}")
    public ResponseEntity<List<Travel>> getByUser(@PathVariable Long id){
        return ResponseEntity.ok(travelService.getTravelByUser(id));
    }

    @GetMapping("/HR/{id}")
    public ResponseEntity<List<Travel>> getBYHR(@PathVariable Long id){
        return ResponseEntity.ok(travelService.getTravelHR(id));
    }

    @PostMapping(value = "{travelId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TravelDocument upload(@PathVariable Long travelId,@RequestParam("file") MultipartFile file,
                                 @RequestParam("userId") Long userId) throws IOException {
        return travelService.uploadDocument(travelId,file, userId);
    }


    @GetMapping("/Document/{travelId}")
    public ResponseEntity<List<TravelDocument>> getDocuments(@PathVariable Long travelId){
        List<TravelDocument> documents = travelService.getDocumentsByTravel(travelId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/Document/{travelId}/user/{userId}")
    public ResponseEntity<List<TravelDocument>> getDocumentsByUser(@PathVariable Long travelId, @PathVariable Long userId){
        List<TravelDocument> documents = travelService.getDocumentsByTravelAndUser(travelId, userId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/Document/{travelId}/manager/{managerId}")
    public ResponseEntity<List<TravelDocument>> getDocumentsByManager(@PathVariable Long travelId, @PathVariable Long managerId){
        List<TravelDocument> documents = travelService.getDocumentsByTravelAndManager(travelId, managerId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("Document/{docId}/url")
    public ResponseEntity<String> getDocument(@PathVariable Long docId){
        return ResponseEntity.ok(travelService.getDocument(docId));
    }
}