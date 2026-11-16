using Cars.Application.Cars;
using Cars.Application.Cars.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cars.API.Controllers;

[Authorize]
[ApiController]
[Route("api/features")]
public class FeaturesController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet]
    public async Task<ActionResult<List<FeatureDto>>> GetFeatures() => await _sender.Send(new GetFeaturesList.Query());
}
