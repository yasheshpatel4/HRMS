package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense,Long> {

    @Query("SELECT e FROM Expense e " +
            "JOIN e.travel t " +
            "JOIN t.assignedUsers u " +
            "WHERE u.userId = :userId AND t.travelId = :travelId")
    List<Expense> findByUserTravel(@Param("userId") Long userId, @Param("travelId") Long travelId);


}
