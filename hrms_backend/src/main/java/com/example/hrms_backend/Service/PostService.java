package com.example.hrms_backend.Service;

import com.example.hrms_backend.Entity.Post;
import com.example.hrms_backend.Repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    @Autowired
    PostRepository postRepository;

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
        postRepository.save(post);
    }
}
