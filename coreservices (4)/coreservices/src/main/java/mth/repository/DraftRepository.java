package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Draft;

@Repository
public interface DraftRepository extends JpaRepository<Draft, Long> {
	List<Draft> findByAuthorId(Long authorId);
}
