using Microsoft.AspNetCore.Mvc;

namespace OrienteeringEvents.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Hello from .NET backend!" });
        }
    }
}
