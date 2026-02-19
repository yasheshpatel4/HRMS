package com.example.hrms_backend.Repository;

import com.example.hrms_backend.Entity.FairnessQueue;
import com.example.hrms_backend.Entity.Game;
import com.example.hrms_backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FairnessQueueRepository extends JpaRepository<FairnessQueue,Long> {
    @Query("delete FairnessQueue fq where fq.game=:game and fq.user=:user")
    void deleteByGameUser(Game game, User user);

    Optional<FairnessQueue> findByUserAndGame(User user, Game game);

}
