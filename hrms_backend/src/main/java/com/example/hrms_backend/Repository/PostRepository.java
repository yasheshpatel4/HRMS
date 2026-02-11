package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Comment;
import com.example.hrms_backend.Entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post,Long> {


}
