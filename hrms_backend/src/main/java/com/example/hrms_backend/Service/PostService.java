package com.example.hrms_backend.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hrms_backend.Entity.Comment;
import com.example.hrms_backend.Entity.Post;
import com.example.hrms_backend.Entity.User;
import com.example.hrms_backend.Repository.CommentRepository;
import com.example.hrms_backend.Repository.PostRepository;
import com.example.hrms_backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PostService {
    @Autowired
    PostRepository postRepository;
    @Autowired
    CommentRepository commentRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    EmailService emailService;
    @Autowired
    Cloudinary cloudinary;

    @Cacheable(value = "posts", key = "#pageable.pageNumber")
    public Page<Post> getAllPost(Pageable pageable) {
        return postRepository.findAll(pageable);
    }


    public Optional<Post> getPost(Long id){
        return postRepository.findById(id);
    }
    public void deletePost(Long id){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("user not found"));
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("post not found"));
        if (!post.getOwner().equals(currentUser) && !currentUser.getRole().name().equals("HR")) {
            throw new RuntimeException("You do not have permission to delete this post");
        }
        if (currentUser.getRole().name().equals("HR") && !post.getOwner().equals(currentUser)) {
            emailService.sendEmail(post.getOwner().getEmail(), "Warning: Post Deleted by HR",
                    "Your post titled '" + post.getTitle() + "' has been deleted by HR for inappropriate content.");
        }
        postRepository.deleteById(id);
    }

//    public Post updatePost(Long id,Post post,MultipartFile file) throws IOException{
//        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//        User currentUser = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
//
//        Post existingPost = postRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Post not found"));
//
//        if (!existingPost.getOwner().equals(currentUser) && !currentUser.getRole().name().equals("HR")) {
//            throw new RuntimeException("No permission to update");
//        }
//
//        if (file != null && !file.isEmpty()) {
//            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
//                    ObjectUtils.asMap("folder", "/Posts/"));
//            existingPost.setFilePath(uploadResult.get("url").toString());
//        }
//
//        existingPost.setPost(post.getPost());
//        existingPost.setDescription(post.getDescription());
//        existingPost.setTitle(post.getTitle());
//        existingPost.setTags(post.getTags());
//        existingPost.setVisibility(post.getVisibility());
//
//        return postRepository.save(existingPost);
//    }

    public void createPost(Post post, MultipartFile file) throws IOException {
        String email=SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("user not found"));
        if (file != null && !file.isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "/Posts/"));
            post.setFilePath(uploadResult.get("url").toString());
        }

        post.setOwner(user);
        post.setCreatedAt(LocalDateTime.now());
        if (post.getVisibility() == null) {
            post.setVisibility("all");
        }
        postRepository.save(post);
    }

    public void addLike(Long postId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("user not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("post not found"));
        if (!post.getLikedBy().contains(user)) {
            post.getLikedBy().add(user);
            postRepository.save(post);
        }
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

    public List<Post> searchPosts(String author, String tag, LocalDateTime startDate, LocalDateTime endDate) {
        return postRepository.searchPosts(author, tag, startDate, endDate);
    }
    @Scheduled(cron = "0 0 0 * * ?")
    public void generateCelebrationPosts() {
        LocalDate today = LocalDate.now();

        List<User> usersWithBirthday = userRepository.findAll().stream()
                .filter(user -> user.getDob() != null &&
                        user.getDob().getMonth() == today.getMonth() &&
                        user.getDob().getDayOfMonth() == today.getDayOfMonth())
                .toList();

        for (User user : usersWithBirthday) {
            Post birthdayPost = new Post();
            birthdayPost.setTitle("Happy Birthday!");
            birthdayPost.setContent("Today is " + user.getName() + "'s birthday! Wish them a happy birthday.");
            birthdayPost.setDescription("System-generated birthday post");
            birthdayPost.setOwner(user);
            birthdayPost.setCreatedAt(LocalDateTime.now());
            birthdayPost.setVisibility("all");
            birthdayPost.setIsSystemGenerated(true);
            postRepository.save(birthdayPost);
        }

        List<User> usersWithAnniversary = userRepository.findAll().stream()
                .filter(user -> user.getDoj() != null)
                .filter(user -> {
                    long years = ChronoUnit.YEARS.between(user.getDoj(), today);
                    return years > 0 && LocalDate.of(today.getYear(), user.getDoj().getMonth(), user.getDoj().getDayOfMonth()).equals(today);
                })
                .toList();

        for (User user : usersWithAnniversary) {
            long years = ChronoUnit.YEARS.between(user.getDoj(), today);
            Post anniversaryPost = new Post();
            anniversaryPost.setTitle("Work Anniversary!");
            anniversaryPost.setContent(user.getName() + " completes " + years + " years at the organization. Congratulations!");
            anniversaryPost.setDescription("System-generated anniversary post");
            anniversaryPost.setOwner(user);
            anniversaryPost.setCreatedAt(LocalDateTime.now());
            anniversaryPost.setVisibility("all");
            anniversaryPost.setIsSystemGenerated(true);
            postRepository.save(anniversaryPost);
        }
    }
}
