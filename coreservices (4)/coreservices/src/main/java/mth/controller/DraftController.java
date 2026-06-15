package mth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import mth.models.Draft;
import mth.services.DraftService;

@RestController
@RequestMapping("/draft")
public class DraftController {

	@Autowired
	DraftService draftService;
	
	@PostMapping("/save")
	public Object saveDraft(@RequestBody Draft draft, @RequestHeader(value = "Token", required = false) String token) {
		return draftService.saveDraft(draft, token);
	}
	
	@GetMapping("/author/{authorId}")
	public Object getDraftsByAuthor(@PathVariable("authorId") Long authorId, @RequestHeader(value = "Token", required = false) String token) {
		return draftService.getDraftsByAuthor(authorId, token);
	}

	@DeleteMapping("/delete/{draftId}")
	public Object deleteDraft(@PathVariable("draftId") Long draftId, @RequestHeader(value = "Token", required = false) String token) {
		return draftService.deleteDraft(draftId, token);
	}
}
