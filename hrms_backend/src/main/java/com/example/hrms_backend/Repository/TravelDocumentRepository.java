package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelDocumentRepository extends JpaRepository<TravelDocument,Long> {
}
