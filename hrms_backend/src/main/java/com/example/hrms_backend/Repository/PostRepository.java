package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Comment;
import com.example.hrms_backend.Entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post,Long> {
//    List<Post> findAllByOrderByCreatedAtDesc();

    @Query("select p from Post p where " +
            "(:author is null or p.owner.name like %:author%) AND " +
            "(:tag is null or p.tags like %:tag%) AND " +
            "(:startDate is null or p.createdAt >= :startDate) AND " +
            "(:endDate is null or p.createdAt <= :endDate)")
    List<Post> searchPosts( String author, String tag, LocalDateTime startDate, LocalDateTime endDate);

    Page<Post> findAllByIsDeletedFalse(Pageable pageable);
}
