using Cars.Application.Cars.DTOs;
using Cars.Domain;
using Cars.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Cars.Application.Cars;

public class Details
{
    public class Query : IRequest<CarDto?>
    {
        public Guid Id { get; set; }
    }

    public class Handler(DataContext context) : IRequestHandler<Query, CarDto?>
    {
        private readonly DataContext _context = context;

        public async Task<CarDto?> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _context.Cars
                .AsNoTracking()
                .Select(car => new CarDto
                {
                    Id = car.Id,
                    Brand = car.Brand,
                    Model = car.Model,
                    DoorsNumber = car.DoorsNumber,
                    LuggageCapacity = car.LuggageCapacity,
                    EngineCapacity = car.EngineCapacity,
                    FuelType = car.FuelType,
                    ProductionDate = car.ProductionDate,
                    AverageFuelConsumption = car.AverageFuelConsumption,
                    BodyType = car.BodyType,
                    Photos = car.Photos
                        .Select(photo => new CarPhotoDto(photo.Id, photo.Url, photo.IsMain))
                        .ToList(),
                    Features = car.Features
                        .Select(feature => new FeatureDto(feature.Id, feature.Name))
                        .ToList(),
                })
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        }
    }
}
