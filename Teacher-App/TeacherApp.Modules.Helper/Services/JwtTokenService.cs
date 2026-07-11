using TeacherApp.Modules.Entities.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TeacherApp.Modules.Helper.Services
{
    public class JwtTokenService:IJwtTokenService 
    {
        private readonly IConfiguration _configuration;


        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;   
        }

        public TokenResponse GenerateToken(User user, string roles="")
        {  
            var claims = new[]
           {
                    new Claim(ClaimTypes.Name, user.Id),
                    new Claim(ClaimTypes.Role,roles)
                };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            var refreshToken = Guid.NewGuid().ToString();

            return new TokenResponse
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                RefreshToken = refreshToken    
         
            };
        }

  
    }
}