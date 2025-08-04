using Microsoft.AspNetCore.Mvc;
using LegalApp.API.Services;
using LegalApp.API.DTOs;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto loginRequest)
        {
            try
            {
                var result = await _authService.LoginAsync(loginRequest);
                if (result == null)
                {
                    return Unauthorized(new { message = "Email o contraseña incorrectos" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterRequestDto registerRequest)
        {
            try
            {
                var user = await _authService.RegisterAsync(registerRequest);
                if (user == null)
                {
                    return BadRequest(new { message = "No se pudo crear el usuario. El email puede estar en uso o el rol es inválido." });
                }

                return Ok(new { message = "Usuario creado exitosamente", userId = user.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("validate")]
        public async Task<ActionResult> ValidateUser([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                var isValid = await _authService.ValidateUserAsync(email, password);
                return Ok(new { isValid });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
