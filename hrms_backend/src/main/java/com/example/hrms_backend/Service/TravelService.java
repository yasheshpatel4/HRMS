package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Travel;
import com.example.hrms_backend.Repository.TravelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TravelService {
    @Autowired
    private TravelRepository travelRepository;

    public Optional<Travel> getTravelById(Long id)
    {
        return travelRepository.findById(id);
    }
    public List<Travel> getAllTravel(){
        return travelRepository.findAll();
    }
    public String addTravel(Travel travel){
        travelRepository.save(travel);
        return "successful";
    }
    public String deleteTravel(Travel travel){
        travelRepository.delete(travel);
        return "successful";
    }
    public Travel updateTravel(Travel travel) {

        return travelRepository.findById(travel.getTravelId())
                .map(existingTravel -> {
                    existingTravel.setAssignedUsers(travel.getAssignedUsers());
                    existingTravel.setTitle(travel.getTitle());
                    existingTravel.setStartDate(travel.getStartDate());
                    existingTravel.setEndDate(travel.getEndDate());
                    existingTravel.setDescription(travel.getDescription());
                    return travelRepository.save(existingTravel);
                })
                .orElseThrow(() -> new RuntimeException("Travel record not found"));
    }

    public List<Travel> getTravelByUser(Long userId)
    {
        return travelRepository.findByUser(userId);
    }
    public List<Travel> getTravelHR(Long hrId)
    {
        return travelRepository.findByHR(hrId);
    }



}
