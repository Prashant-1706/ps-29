package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Content;
import mth.repository.ContentRepository;

@Service
public class ContentService {
	@Autowired
	ContentRepository contentRepo;

	public Map<String, Object> publishContent(Content content, String token) {
		Map<String, Object> map = new HashMap<>();
		try {
			contentRepo.save(content);
			map.put("code", 200);
			map.put("message", "Content published successfully.");
			map.put("data", content);
		} catch(Exception e) {
			map.put("code", 500);
			map.put("message", e.getMessage());
		}
		return map;
	}

	public Map<String, Object> getContentByAuthor(Long authorId, String token) {
		Map<String, Object> map = new HashMap<>();
		try {
			List<Content> contents = contentRepo.findByAuthorId(authorId);
			map.put("code", 200);
			map.put("data", contents);
		} catch(Exception e) {
			map.put("code", 500);
			map.put("message", e.getMessage());
		}
		return map;
	}

	public Map<String, Object> deleteContent(Long contentId, String token) {
		Map<String, Object> map = new HashMap<>();
		try {
			contentRepo.deleteById(contentId);
			map.put("code", 200);
			map.put("message", "Content deleted successfully.");
		} catch(Exception e) {
			map.put("code", 500);
			map.put("message", e.getMessage());
		}
		return map;
	}
}
