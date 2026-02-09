package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TravelRepository extends JpaRepository<Travel,Long> {
    @Query("SELECT t FROM Travel t JOIN t.assignedUsers u WHERE u.userId = :userId")
    List<Travel> findByUser(@Param("userId") Long userId);

    @Query("SELECT t FROM Travel t WHERE t.createdBy = :hrId")
    List<Travel> findByHR( Long hrId);

}
