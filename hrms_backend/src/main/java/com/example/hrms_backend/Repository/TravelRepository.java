package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Travel;
import com.example.hrms_backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TravelRepository extends JpaRepository<Travel,Long> {
    @Query("SELECT t FROM Travel t JOIN t.assignedUsers u WHERE u.userId = :userId AND t.isDeleted=false")
    List<Travel> findByUser(@Param("userId") Long userId);

    @Query("SELECT t FROM Travel t WHERE t.createdBy = :user AND t.isDeleted=false")
    List<Travel> findByHR( User user);

    List<Travel> findByIsDeletedFalse();
}
