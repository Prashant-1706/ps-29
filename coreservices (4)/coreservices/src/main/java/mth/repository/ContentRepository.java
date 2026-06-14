package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Content;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
	List<Content> findByAuthorId(Long authorId);
}
