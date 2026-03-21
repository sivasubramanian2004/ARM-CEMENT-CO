import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();

  async function loadProducts() {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      setMessage('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Product card component handles quantity selection and ordering per-product
  function ProductCard({ product }) {
    const [qty, setQty] = useState('');
    const [localPlacing, setLocalPlacing] = useState(false);

    // Choose varied high-quality images for products.
    function getProductImage() {
      if (product.image) return product.image;

      // curated image pools per category (Unsplash)
      const pools = {
        cement: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=640&h=480&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640&h=480&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1600054825409-2e3f3a1b2f3d?w=640&h=480&auto=format&fit=crop&q=60'
        ],
        steel: [
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=480&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=640&h=480&auto=format&fit=crop&q=60'
        ],
        tiles: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=640&h=480&auto=format&fit=crop&q=60'
        ],
        paints: [
          'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=640&h=480&auto=format&fit=crop&q=60'
        ],
        other: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=480&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1503602642458-232111445657?w=640&h=480&auto=format&fit=crop&q=60'
        ]
      };

      // Specific product name overrides
      const specific = {
        'JSW': pools.steel[0],
        'RAMCO': pools.cement[0],
        'ULTRATECH': pools.cement[1] || pools.cement[0],
        'ULTRA': pools.cement[0],
        'BELL': pools.tiles[0]
      };

      const name = (product.name || '').toUpperCase();
      for (const key of Object.keys(specific)) {
        if (name.includes(key)) return specific[key];
      }

      // choose pool by category
      const cat = (product.category || 'other').toLowerCase();
      if (cat === 'cement') {
        const arr = pools.cement; return arr[hashModulo(product._id, arr.length)];
      }
      if (cat === 'steel') {
        const arr = pools.steel; return arr[hashModulo(product._id, arr.length)];
      }
      if (cat === 'tiles') {
        const arr = pools.tiles; return arr[hashModulo(product._id, arr.length)];
      }
      if (cat === 'other') {
        const arr = pools.other; return arr[hashModulo(product._id, arr.length)];
      }

      // fallback
      return pools.other[0];
    }

    function hashModulo(str, mod) {
      if (!str) return 0;
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
      return h % mod;
    }

    const total = qty ? (Number(product.price) * Number(qty)).toFixed(2) : '0.00';

    async function placeOrder() {
      if (!isAuthenticated) {
        setMessage('Please login to place orders');
        return;
      }
      if (qty < 1) return setMessage('Quantity must be at least 1');
      if (product.stock && qty > product.stock) return setMessage('Quantity exceeds stock');

      setLocalPlacing(true);
      setMessage('');
      try {
        await api.post('/orders', { items: [{ productId: product._id, quantity: Number(qty) }] });
        setMessage('Order placed');
        loadProducts();
      } catch (err) {
        const errorData = err.response?.data;
        if (errorData?.errors && errorData.errors.length > 0) {
          setMessage(errorData.errors[0].msg);
        } else {
          setMessage(errorData?.message || 'Failed to place order');
        }
      } finally {
        setLocalPlacing(false);
      }
    }

    function dec() {
      if (!qty) return setQty(1);
      setQty((prev) => Math.max(1, Number(prev) - 1));
    }
    function inc() {
      setQty((prev) => Math.min(product.stock || 99999, Number(prev || 0) + 1));
    }

    return (
      <div className="product-card" key={product._id}>
        <div className="product-image">
          <img src={getProductImage()} alt={product.name} />
        </div>
        <div className="product-meta">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h3 style={{ margin: 0 }}>{product.name}</h3>
            <span className="badge">{product.category}</span>
            <p style={{ margin: 0, color: 'var(--muted)' }}>{product.description || 'No description'}</p>
            <div style={{ color: 'var(--muted)' }}>Price: Rs. {product.price}</div>
            <div style={{ color: 'var(--muted)' }}>Stock: {product.stock}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div className="stepper">
              <button type="button" onClick={dec} aria-label="decrease">−</button>
              <input
                type="number"
                min="1"
                max={product.stock || 99999}
                placeholder="1"
                value={qty}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') return setQty('');
                  const n = Number(v);
                  if (Number.isNaN(n)) return;
                  setQty(Math.max(1, Math.min(product.stock || 99999, n)));
                }}
              />
              <button type="button" onClick={inc} aria-label="increase">+</button>
            </div>
            <div className="product-total">Total: Rs. {total}</div>
            <div>
              <button
                className="btn-primary"
                onClick={placeOrder}
                disabled={localPlacing || product.stock < 1 || !qty}
              >
                {product.stock < 1
                  ? 'Out of stock'
                  : !qty
                  ? 'Enter quantity'
                  : localPlacing
                  ? 'Working…'
                  : `Order x${qty} — Rs. ${total}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Image Carousel */}
      <div className="image-carousel">
        <div className="carousel-container">
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop" alt="Cement bags" />
            <p>Cement Bags (Ultra Tech, Ramco, Arasu)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop" alt="Steel rods" />
            <p>Steel Rods (Amman Steel, Ran India Steel)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop" alt="Ceramic tiles" />
            <p>Ceramic Tiles (Bell Ceramics)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=400&fit=crop" alt="Paints" />
            <p>Paints (Asian Paints, Nippon Paint)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop" alt="Plastic tanks and doors" />
            <p>Plastic Tanks & Doors (Sintex)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop" alt="Cement bags" />
            <p>Cement Bags (Ultra Tech, Ramco, Arasu)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop" alt="Steel rods" />
            <p>Steel Rods (Amman Steel, Ran India Steel)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop" alt="Ceramic tiles" />
            <p>Ceramic Tiles (Bell Ceramics)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=400&fit=crop" alt="Paints" />
            <p>Paints (Asian Paints, Nippon Paint)</p>
          </div>
          <div className="carousel-item">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop" alt="Plastic tanks and doors" />
            <p>Plastic Tanks & Doors (Sintex)</p>
          </div>
        </div>
      </div>

      <div className="heading">
        <div>
          <h2>Products</h2>
          <p>Browse available cement and steel items.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadProducts} disabled={loading}>
          Refresh
        </button>
      </div>

      {message && <div className="card">{message}</div>}

      {loading ? (
        <div className="card">Loading products…</div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
