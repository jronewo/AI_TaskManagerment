using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskCommentsController : ControllerBase
    {
        private readonly ITaskCommentService _commentService;

        public TaskCommentsController(ITaskCommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetByTask(int taskId)
        {
            var comments = await _commentService.GetTaskCommentsAsync(taskId);
            return Ok(comments);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTaskCommentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content) && string.IsNullOrWhiteSpace(dto.ImageUrl))
                return BadRequest(new { message = "Bình luận cần có nội dung hoặc hình ảnh." });

            var result = await _commentService.AddCommentAsync(dto);
            return Ok(result);
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> Delete(int commentId)
        {
            var result = await _commentService.DeleteCommentAsync(commentId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
