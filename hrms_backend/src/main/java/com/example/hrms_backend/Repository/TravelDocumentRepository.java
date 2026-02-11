package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelDocumentRepository extends JpaRepository<TravelDocument,Long> {

    @Query("select td from TravelDocument td where td.travel.travelId =:travelId")
    List<TravelDocument> findDocumentsByTravel(Long travelId);

    @Query("select td from TravelDocument td where td.travel.travelId =:travelId and td.user.userId= :userId")
    List<TravelDocument> findDocumentsByTravelAndUser(Long travelId, Long userId);

    @Query("select td from TravelDocument td where td.travel.travelId =:travelId and td.user.manager.userId= :managerId")
    List<TravelDocument> findDocumentsByTravelAndManager(Long travelId, Long managerId);

    @Query("select td.filePath from TravelDocument td where td.docId=:docId")
    String findDocumentURL(Long docId);
}
