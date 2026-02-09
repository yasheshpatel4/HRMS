package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Travel;
import com.example.hrms_backend.Service.TravelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<String> addTravel(@RequestBody Travel travel){
        return ResponseEntity.ok(travelService.addTravel(travel));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<Travel>> getByUser(@PathVariable Long id){
        return ResponseEntity.ok(travelService.getTravelByUser(id));
    }

    @GetMapping("/HR/{id}")
    public ResponseEntity<List<Travel>> getBYHR(@PathVariable Long id){
        return ResponseEntity.ok(travelService.getTravelHR(id));
    }

}
