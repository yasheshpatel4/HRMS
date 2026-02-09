package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Job;
import com.example.hrms_backend.Entity.Post;
import com.example.hrms_backend.Service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Post")
public class PostController {
    @Autowired
    PostService postService;

    @GetMapping("/all")
    public ResponseEntity<List<Post>> getAllPost(){
        return ResponseEntity.ok(postService.getAllPost());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Optional<Post>> getPost(@PathVariable Long id){
        return ResponseEntity.ok(postService.getPost(id));
    }

    @PostMapping
    public ResponseEntity<Post> updatePost(@RequestBody Post post){
        return ResponseEntity.ok(postService.updatePost(post));
    }
    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id){
        postService.deletePost(id);
    }
    @PostMapping("/add")
    public void addJob(@RequestBody Post post){
        postService.createPost(post);
    }
}
