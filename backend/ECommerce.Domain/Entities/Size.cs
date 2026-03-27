using System;

namespace ECommerce.Domain.Entities
{
    public class Size : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
