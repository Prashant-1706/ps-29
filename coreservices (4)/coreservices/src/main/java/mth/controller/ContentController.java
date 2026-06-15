package mth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import mth.models.Content;
import mth.services.ContentService;

@RestController
@RequestMapping("/content")
public class ContentController {

	@Autowired
	ContentService contentService;
	
	@PostMapping("/publish")
	public Object publishContent(@RequestBody Content content, @RequestHeader(value = "Token", required = false) String token) {
		return contentService.publishContent(content, token);
	}
	
	@GetMapping("/author/{authorId}")
	public Object getContentByAuthor(@PathVariable("authorId") Long authorId, @RequestHeader(value = "Token", required = false) String token) {
		return contentService.getContentByAuthor(authorId, token);
	}

	@DeleteMapping("/delete/{contentId}")
	public Object deleteContent(@PathVariable("contentId") Long contentId, @RequestHeader(value = "Token", required = false) String token) {
		return contentService.deleteContent(contentId, token);
	}
}
