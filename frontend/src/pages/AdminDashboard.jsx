import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: 'Electronics',
  image: '',
  stock: '',
  tags: '',
};

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('inventory');
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/products'),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/login" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
    };

    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
      } else {
        await API.post('/products', payload);
      }
      setForm(emptyProduct);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      tags: (product.tags || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="container loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container admin-page">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Manage inventory and view store analytics</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{stats?.totalProducts || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{stats?.totalOrders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Users</div>
          <div className="value">{stats?.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Revenue</div>
          <div className="value">${(stats?.totalRevenue || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>
          Inventory
        </button>
        <button className={tab === 'lowstock' ? 'active' : ''} onClick={() => setTab('lowstock')}>
          Low Stock
        </button>
      </div>

      {tab === 'inventory' && (
        <>
          <form className="product-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" className="form-control" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input type="number" className="form-control" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Image URL</label>
                <input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input className="form-control" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.stock <= 10 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)} style={{ marginRight: '0.5rem' }}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'lowstock' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.lowStock || []).map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td><span className="badge badge-warning">{p.stock}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setTab('inventory'); handleEdit(p); }}>
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
              {(stats?.lowStock || []).length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                    All products are well stocked
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
