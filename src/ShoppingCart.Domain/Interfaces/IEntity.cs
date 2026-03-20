namespace ShoppingCart.Domain.Interfaces;

public interface IEntity<TId> where TId : struct
{
    TId Id { get; }
    DateTime CreatedAt { get; }
    DateTime? UpdatedAt { get; }
}

public interface IAggregateRoot<TId> : IEntity<TId> where TId : struct
{
}

public interface IRepository<T, TId> where T : class, IEntity<TId> where TId : struct
{
    Task<T?> GetByIdAsync(TId id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(TId id, CancellationToken cancellationToken = default);
}

public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
