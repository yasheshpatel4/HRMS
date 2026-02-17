package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Post;
import com.example.hrms_backend.Service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    @PostMapping("/create")
    public void addJob(@RequestBody Post post){
        postService.createPost(post);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<String> addlike(@PathVariable Long postId){
        postService.addLike(postId);
        return ResponseEntity.ok("successful");
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<String> addComment(@PathVariable Long postId,@RequestBody String msg){
        postService.addComment(postId,msg);
        return ResponseEntity.ok("successful");
    }

    @GetMapping("/search")
    public ResponseEntity<List<Post>> searchPosts(
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Post> posts = postService.searchPosts(author, tag, startDate, endDate);
        return ResponseEntity.ok(posts);
    }
}
