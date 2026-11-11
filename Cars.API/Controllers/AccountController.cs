using System.Text;
using Cars.API.DTOs;
using Cars.API.Services;
using Cars.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace Cars.API.Controllers;

[ApiController]
[Route("api/account")]
public class AccountController(
    UserManager<AppUser> userManager,
    ITokenService tokenService,
    IEmailService emailService,
    IConfiguration configuration) : ControllerBase
{
    private readonly UserManager<AppUser> _userManager = userManager;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto dto)
    {
        var user = new AppUser
        {
            UserName = dto.UserName.Trim(),
            Email = dto.Email.Trim(),
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(
            result.Errors.Select(error => error.Description));
        }

        await _userManager.AddToRoleAsync(user, "User");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var clientBaseUrl = _configuration["Client:BaseUrl"] ?? throw new InvalidOperationException("Brak Client:BaseUrl.");
        var confirmationUrl =
            $"{clientBaseUrl}/confirm-email"
            + $"?userId={Uri.EscapeDataString(user.Id)}"
            + $"&token={Uri.EscapeDataString(encodedToken)}";

        await _emailService.SendAsync(
            user.Email!,
            "Potwierdź konto Cars",
            $"""
            <h2>Cars</h2>
            <p>Kliknij poniższy link, aby aktywować konto:</p>
            <p><a href="{confirmationUrl}">
            Potwierdź adres e-mail
            </a></p>
            """);

        return Ok(new
        {
            message = "Konto utworzono. Sprawdź e-mail i potwierdź rejestrację.",
        });
    }

    [HttpPost("confirm-email")]
    public async Task<ActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return BadRequest("Nieprawidłowy użytkownik.");
        }

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        }
        catch
        {
            return BadRequest("Nieprawidłowy token.");
        }

        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
        if (!result.Succeeded)
        {
            return BadRequest("Nie udało się potwierdzić konta.");
        }

        return Ok(new
        {
            message = "Adres e-mail został potwierdzony.",
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
        if (user is null)
        {
            return Unauthorized("Nieprawidłowy e-mail lub hasło.");
        }

        var passwordCorrect = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordCorrect)
        {
            return Unauthorized("Nieprawidłowy e-mail lub hasło.");
        }

        if (!user.EmailConfirmed)
        {
            return Unauthorized("Najpierw potwierdź adres e-mail.");
        }

        return Ok(await CreateUserDtoAsync(user));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
        if (user is not null && user.EmailConfirmed)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var clientBaseUrl = _configuration["Client:BaseUrl"] ?? throw new InvalidOperationException("Brak Client:BaseUrl.");

            var resetUrl =
                $"{clientBaseUrl}/reset-password"
                + $"?email={Uri.EscapeDataString(user.Email!)}"
                + $"&token={Uri.EscapeDataString(encodedToken)}";

            await _emailService.SendAsync(
                user.Email!,
                "Reset hasła Cars",
                $"""
                <h2>Cars</h2>
                <p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
                <p><a href="{resetUrl}">Ustaw nowe hasło</a></p>
                """);
        }

        return Ok(new
        {
            message = "Jeżeli konto istnieje, wysłaliśmy wiadomość z instrukcją.",
        });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
        if (user is null)
        {
            return BadRequest("Nie udało się zresetować hasła.");
        }

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(dto.Token));
        }
        catch
        {
            return BadRequest("Nieprawidłowy token.");
        }

        var result = await _userManager.ResetPasswordAsync(
            user,
            decodedToken,
            dto.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(error => error.Description));
        }

        return Ok(new
        {
            message = "Hasło zostało zmienione.",
        });
    }

    private async Task<UserDto> CreateUserDtoAsync(AppUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return new UserDto(
            user.Id,
            user.UserName ?? string.Empty,
            user.Email ?? string.Empty,
            await _tokenService.CreateTokenAsync(user),
            [.. roles]);
    }
}
