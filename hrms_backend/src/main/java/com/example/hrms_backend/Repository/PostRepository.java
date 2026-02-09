package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post,Long> {

}
