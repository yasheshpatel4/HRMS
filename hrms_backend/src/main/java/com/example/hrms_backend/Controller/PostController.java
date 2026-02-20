package com.example.hrms_backend.Controller;

import com.example.hrms_backend.Entity.Post;
import com.example.hrms_backend.Service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Post")
public class PostController {
    @Autowired
    PostService postService;

    @GetMapping("/all")
    @Cacheable(value = "posts", key = "#pageable.pageNumber")
    public ResponseEntity<Page<Post>> getAllPost(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(postService.getAllPost(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Post>> getPost(@PathVariable Long id){
        return ResponseEntity.ok(postService.getPost(id));
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id){
        postService.deletePost(id);
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void addPost(
            @ModelAttribute Post post,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        postService.createPost(post, file);
    }


//    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public Post updatePost(
//            @PathVariable Long id,
//            @ModelAttribute Post post,
//            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
//        return postService.updatePost(id, post, file);
//    }

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
