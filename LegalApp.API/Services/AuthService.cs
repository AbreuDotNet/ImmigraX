using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models;
using LegalApp.API.DTOs;

namespace LegalApp.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
        Task<User?> RegisterAsync(RegisterRequestDto registerRequest);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> ValidateUserAsync(string email, string password);
    }

    public class AuthService : IAuthService
    {
        private readonly LegalAppDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthService(LegalAppDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
        {
            var user = await GetUserByEmailAsync(loginRequest.Email);
            if (user == null || !user.IsActive)
                return null;

            // Verificar que el usuario esté asociado a al menos un bufete legal
            if (user.UserLawFirms == null || !user.UserLawFirms.Any())
            {
                // Si es un usuario Master, puede que no tenga asociaciones aún, verificar por rol
                if (user.Role != UserRole.Master)
                    return null;
            }

            if (!VerifyPassword(loginRequest.Password, user.PasswordHash))
                return null;

            var token = _jwtService.GenerateToken(user);
            var jwtSettings = _context.Database.GetDbConnection().ConnectionString;
            var expirationMinutes = 60; // From configuration

            return new LoginResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
            };
        }

        public async Task<User?> RegisterAsync(RegisterRequestDto registerRequest)
        {
            // Check if user already exists
            var existingUser = await GetUserByEmailAsync(registerRequest.Email);
            if (existingUser != null)
                return null;

            // Validate role
            if (!Enum.TryParse<UserRole>(registerRequest.Role, true, out var userRole))
                return null;

            var user = new User
            {
                FullName = registerRequest.FullName,
                Email = registerRequest.Email,
                PasswordHash = HashPassword(registerRequest.Password),
                Role = userRole,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.UserLawFirms)
                .ThenInclude(ulf => ulf.LawFirm)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> ValidateUserAsync(string email, string password)
        {
            var user = await GetUserByEmailAsync(email);
            if (user == null || !user.IsActive)
                return false;

            return VerifyPassword(password, user.PasswordHash);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
