package com.example.hrms_backend.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hrms_backend.Entity.Travel;
import com.example.hrms_backend.Entity.TravelDocument;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.TravelDocumentRepository;
import com.example.hrms_backend.Repository.TravelRepository;
import com.example.hrms_backend.Repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TravelService {

    @Autowired
    private TravelRepository travelRepository;
    @Autowired
    private TravelDocumentRepository travelDocumentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private EmailService emailService;
    @Autowired
    ModelMapper modelMapper;
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private userService userService;

    public Optional<Travel> getTravelById(Long id) {
        return travelRepository.findById(id);
    }

    public List<Travel> getAllTravel() {
        return travelRepository.findByIsDeletedFalse();
    }


    public String deleteTravel(Long travelId) {
        Travel travel=travelRepository.findById(travelId).orElseThrow(()->new RuntimeException("travel not found"));
        if(travel.getStartDate().isBefore(LocalDate.now())){
            return "Can not delete after start date!";
        }
        travel.setDeleted(true);
        travelRepository.save(travel);
        return "successful";
    }

    public Travel updateTravel(Travel travel) {
        if(travel.getStartDate().isBefore(LocalDate.now())){
            throw new RuntimeException("Can not update after start date");
        }
        return travelRepository.findById(travel.getTravelId())
                .map(existingTravel -> {
                    existingTravel.setTitle(travel.getTitle());
                    existingTravel.setStartDate(travel.getStartDate());
                    existingTravel.setEndDate(travel.getEndDate());
                    existingTravel.setDescription(travel.getDescription());
                    existingTravel.setBudget(travel.getBudget());
//                    existingTravel=modelMapper.map(travel,Travel.class);
                    return travelRepository.save(existingTravel);
                })
                .orElseThrow(() -> new RuntimeException("Travel record not found"));
    }

    public List<Travel> getTravelByUser(Long userId) {
        return travelRepository.findByUser(userId);
    }

    public List<Travel> getTravelHR(Long hrId) {
        User user=userRepository.findById(hrId).orElseThrow(() -> new RuntimeException("User not found"));
        return travelRepository.findByHR(user);
    }

    public String createTravel(Travel travel) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        for(User user:travel.getAssignedUsers()){
            if(travelRepository.hasTravelOverlap(user.getUserId(),travel.getStartDate(),travel.getEndDate())){
                return ("travel overlap for user: "+user.getName());
            }
        }

        travel.setCreatedBy(currentUser);
        travel.setCreatedAt(LocalDateTime.now());
        Travel savedTravel = travelRepository.save(travel);

        for (User user : savedTravel.getAssignedUsers()) {
            emailService.sendEmail(user.getEmail(),"Assigned Travel:"+travel.getTitle(),"You have been assigned to travel: " + savedTravel.getTitle());
            notificationService.createNotification(user.getUserId(),"Travel", "You have been assigned to travel: " + savedTravel.getTitle());
        }
        return "Successful";
    }

    public TravelDocument uploadDocument(Long travelId, MultipartFile file, Long userId) throws IOException {

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user not found"));

        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

//        String directory = "uploads/documents/";
//        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
//        Path path = Paths.get(directory + fileName);

//        Files.createDirectories(path.getParent());
//        Files.write(path, file.getBytes());
        TravelDocument document = new TravelDocument();
        File convFile = new File(System.getProperty("java.io.tmpdir") + "/" + file.getOriginalFilename()+"_"+document.getDocId());

        try {
            FileOutputStream fos = new FileOutputStream(convFile);
            fos.write(file.getBytes());
            fos.close();
            var result = cloudinary.uploader().upload(convFile, ObjectUtils.asMap("folder", "/Documents/"));

            document.setTravel(travel);
            document.setUser(targetUser);
            document.setUploadedBy(currentUserEmail);
            if (result != null && result.containsKey("url")) {
                document.setFilePath(result.get("url").toString());
            } else {
                throw new RuntimeException("Cloudinary upload failed: " + result);
            }
            document.setCreatedAt(LocalDateTime.now());
            document.setDocType(file.getContentType());

            return travelDocumentRepository.save(document);
        }
        finally {
            if(convFile.exists()){
                convFile.delete();
            }
        }
    }

    public List<TravelDocument> getDocumentsByTravel(Long travelId) {
        return travelDocumentRepository.findDocumentsByTravel(travelId);
    }

    public List<TravelDocument> getDocumentsByTravelAndUser(Long travelId, Long userId) {
        return travelDocumentRepository.findDocumentsByTravelAndUser(travelId, userId);
    }

    public List<TravelDocument> getDocumentsByTravelAndManager(Long travelId, Long managerId) {
        return travelDocumentRepository.findDocumentsByTravelAndManager(travelId, managerId);
    }

    public String getDocument(Long docId) {
        return travelDocumentRepository.findDocumentURL(docId);
    }

    public String deleteDocument(Long docId) {
        TravelDocument travelDocument=travelDocumentRepository.findById(docId).orElseThrow(()->new RuntimeException("not found"));
        if(travelDocument.getTravel().getEndDate().isBefore(LocalDate.now())){
            return "can't delete document after the travel EndDate.";
        }
        travelDocumentRepository.deleteById(docId);
        return "successful";
    }

    public String updateDocument(Long docId, MultipartFile file) throws IOException{
        TravelDocument document=travelDocumentRepository.findById(docId).orElseThrow(()->new RuntimeException("not found"));
        File convFile = new File(System.getProperty("java.io.tmpdir") + "/" + file.getOriginalFilename()+"_"+document.getDocId());

        try {
            FileOutputStream fos = new FileOutputStream(convFile);
            fos.write(file.getBytes());
            fos.close();
            var result = cloudinary.uploader().upload(convFile, ObjectUtils.asMap("folder", "/Documents/"));
            if (result != null && result.containsKey("url")) {
                document.setFilePath(result.get("url").toString());
            } else {
                throw new RuntimeException("Cloudinary upload failed: " + result);
            }
            document.setDocType(file.getContentType());

            travelDocumentRepository.save(document);
            return "successful";
        }
        finally {
            if (convFile.exists()) {
                convFile.delete();
            }
        }
    }
}
