import './ProductFilters.css';

export default function ProductFilters({ filters, onChange, categories, onSearch }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const clearFilters = () => {
    onChange({
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: '',
      page: 1,
    });
  };

  return (
    <form className="filters-bar" onSubmit={handleSubmit}>
      <div className="form-group search-group">
        <label htmlFor="keyword">Search</label>
        <input
          id="keyword"
          name="keyword"
          className="form-control"
          placeholder="Search products..."
          value={filters.keyword}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select id="category" name="category" className="form-control" value={filters.category} onChange={handleChange}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="minPrice">Min Price</label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          className="form-control"
          placeholder="0"
          value={filters.minPrice}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="maxPrice">Max Price</label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          className="form-control"
          placeholder="999"
          value={filters.maxPrice}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="sort">Sort By</label>
        <select id="sort" name="sort" className="form-control" value={filters.sort} onChange={handleChange}>
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      <div className="filters-actions">
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
        <button type="button" className="btn btn-secondary" onClick={clearFilters}>
          Clear
        </button>
      </div>
    </form>
  );
}
