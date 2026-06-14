package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Draft;
import mth.repository.DraftRepository;

@Service
public class DraftService {
	@Autowired
	DraftRepository draftRepo;

	public Map<String, Object> saveDraft(Draft draft, String token) {
		Map<String, Object> map = new HashMap<>();
		try {
			draftRepo.save(draft);
			map.put("code", 200);
			map.put("message", "Draft saved successfully.");
			map.put("data", draft);
		} catch(Exception e) {
			map.put("code", 500);
			map.put("message", e.getMessage());
		}
		return map;
	}

	public Map<String, Object> getDraftsByAuthor(Long authorId, String token) {
		Map<String, Object> map = new HashMap<>();
		try {
			List<Draft> drafts = draftRepo.findByAuthorId(authorId);
			map.put("code", 200);
			map.put("data", drafts);
		} catch(Exception e) {
			map.put("code", 500);
			map.put("message", e.getMessage());
		}
		return map;
	}
}
