using Cars.Domain;
using Cars.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cars.API.Controllers;

[ApiController]
[Route("api/cars")]
public class CarsController(DataContext context) : ControllerBase
{
    private readonly DataContext _context = context;

    [HttpGet]
    public async Task<ActionResult<List<Car>>> GetCars() => await _context.Cars.AsNoTracking().ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Car>> GetCar(Guid id)
    {
        var car = await _context.Cars
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (car is null) return NotFound();

        return car;
    }

    [HttpPost]
    public async Task<ActionResult<Car>> CreateCar([FromBody] Car car)
    {
        await _context.Cars.AddAsync(car);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCar), new { id = car.Id }, car);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCar(Guid id, [FromBody] Car car)
    {
        var c = await _context.Cars.FindAsync(id);
        if (c == null)
            return NotFound();

        c.AverageFuelConsumption = car.AverageFuelConsumption;
        c.BodyType = car.BodyType;
        c.Brand = car.Brand;
        c.DoorsNumber = car.DoorsNumber;
        c.EngineCapacity = car.EngineCapacity;
        c.FuelType = car.FuelType;
        c.LuggageCapacity = car.LuggageCapacity;
        c.Model = car.Model;
        c.ProductionDate = car.ProductionDate;
        await _context.SaveChangesAsync();

        return Ok(c);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<Car>> DeleteCar(Guid id)
    {
        await _context.Cars
            .Where(c => c.Id == id)
            .ExecuteDeleteAsync();

        return NoContent();
    }
}
