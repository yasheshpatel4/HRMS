package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Comment;
import com.example.hrms_backend.Entity.Post;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.CommentRepository;
import com.example.hrms_backend.Repository.PostRepository;
import com.example.hrms_backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    @Autowired
    PostRepository postRepository;
    @Autowired
    CommentRepository commentRepository;
    @Autowired
    UserRepository userRepository;

    public List<Post> getAllPost(){
        return postRepository.findAll();
    }

    public Optional<Post> getPost(Long id){
        return postRepository.findById(id);
    }
    public void deletePost(Long id){
        postRepository.deleteById(id);
    }

    public Post updatePost(Post post){
        return postRepository.findById(post.getPostId())
                .map(post1 -> {
                    post1.setPost(post.getPost());
                    post1.setDescription(post.getDescription());
                    post1.setTitle(post.getTitle());
                    post1.setTags(post.getTags());
                    post1.setVisibility(post.getVisibility());
                    return postRepository.save(post1);
                })
                .orElseThrow(()->new RuntimeException("post not found"));
    }

    public void createPost(Post post) {
        String email=SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("user not found"));
        post.setOwner(user);
        post.setCreatedAt(LocalDateTime.now());
        postRepository.save(post);
    }

    public void addLike(Long postId) {
    }

    public void addComment(Long postId, String msg) {
        String email=SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("user not found"));
        Post post= postRepository.findById(postId).orElseThrow(()->new RuntimeException("post not found"));
        Comment comment=new Comment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setText(msg);
        commentRepository.save(comment);
    }
}
