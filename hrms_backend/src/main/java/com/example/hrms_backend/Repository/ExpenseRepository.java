package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense,Long> {

    @Query("SELECT e FROM Expense e " +
            "JOIN e.travel t JOIN t.assignedUsers u " +
            "WHERE u.userId = :userId AND t.travelId = :travelId AND e.isDeleted=false")
    List<Expense> findByUserTravel(@Param("userId") Long userId, @Param("travelId") Long travelId);

//    @Modifying
//    @Query("update Expense e set e.status='APPROVED' where e.expenseId=:id")
//    void approve(Long id);
    @Query("select e from Expense e where e.travel.travelId=:travelId and e.isDeleted=false")
    Expense findByTravel(Long travelId);
    @Query("select e from Expense e join e.travel t where t.createdBy.userId = :hrUserId and e.isDeleted=false")
    List<Expense> findByTravelCreatedBy(@Param("hrUserId") Long hrUserId);

    @Query("select COALESCE(SUM(e.amount), 0) from Expense e where e.user.userId = :userId and e.travel.travelId = :travelId and e.isDeleted=false")
    Double getTotalExpenseByUserAndTravel(@Param("userId") Long userId, @Param("travelId") Long travelId);

    List<Expense> findAllByIsDeletedFalse();
}
