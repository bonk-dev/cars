using Cars.Domain;
using Cars.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Cars.Application.Cars;

public sealed class GetCarsList
{
    public sealed class Query : IRequest<List<Car>>
    {
    }

    public sealed class Handler(DataContext context) : IRequestHandler<Query, List<Car>>
    {
        private readonly DataContext _context = context;

        public async Task<List<Car>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _context.Cars
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    }
}
