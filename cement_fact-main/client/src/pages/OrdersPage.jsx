import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext';

const statusOptions = ['pending', 'processing', 'completed', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  async function loadOrders() {
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
      setCurrentPage(1);
    } catch (err) {
      setMessage('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id, status) {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update status');
    }
  }

  async function exportOrdersCSV() {
    try {
      const { data } = await api.get('/orders');
      const rows = [];
      // header
      rows.push(['Order #', 'Date', 'Total', 'Customer Name', 'Customer Email', 'Contact', 'Address', 'Items', 'Status']);

      data.forEach((order) => {
        const itemsStr = order.items
          .map((it) => `${it.product?.name || 'Product'} x${it.quantity} Rs.${it.priceAtPurchase}`)
          .join(' | ');
        const address = `${order.user?.place || ''}${order.user?.address ? ', ' + order.user.address : ''}`;
        rows.push([
          `#${order._id.slice(-6)}`,
          new Date(order.createdAt).toLocaleString(),
          order.total,
          order.user?.name || 'N/A',
          order.user?.email || '',
          order.user?.contactNo || 'N/A',
          address,
          itemsStr,
          order.status
        ]);
      });

      // build CSV
      const csv = rows.map((r) => r.map((c) => {
        if (c === null || c === undefined) return '';
        const s = String(c).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `orders-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage('Failed to download data');
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="heading">
        <div>
          <h2>Orders</h2>
          <p>{user?.role === 'admin' ? 'All orders' : 'Your recent orders'}.</p>
        </div>
        <button className="btn btn-danger" onClick={exportOrdersCSV} disabled={loading}>
          Get Data
        </button>
      </div>

      {message && <div className="card">{message}</div>}

      {loading ? (
        <div className="card">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="card">No orders yet.</div>
      ) : (
        user?.role === 'admin' ? (
          <div className="card">
            <div className="heading">
              <h2>Orders</h2>
              <button className="btn btn-danger" onClick={exportOrdersCSV} disabled={loading}>
                Get Data
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Items</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const start = (currentPage - 1) * itemsPerPage;
                  const paginated = orders.slice(start, start + itemsPerPage);
                  return paginated.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>Rs. {order.total}</td>
                    <td>{order.user?.name || 'N/A'}<br/><small style={{color: 'var(--muted)'}}>{order.user?.email || ''}</small></td>
                    <td>{order.user?.contactNo || 'N/A'}</td>
                    <td>{order.user?.place || ''} {order.user?.address ? `, ${order.user.address}` : ''}</td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                        {order.items.map((item, idx) => (
                          <div key={`${order._id}-${idx}`} className="badge" style={{borderRadius:6}}>
                            <span>{item.product?.name || 'Product'}</span>
                            <span>x{item.quantity}</span>
                            <span>Rs. {item.priceAtPurchase}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <div className={`status-pill ${order.status}`}>{order.status}</div>
                        <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
            {Math.ceil(orders.length / itemsPerPage) > 1 && (
              <div className="pagination">
                {Array.from({ length: Math.ceil(orders.length / itemsPerPage) }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid" style={{ gap: 12 }}>
            {(() => {
              const start = (currentPage - 1) * itemsPerPage;
              const paginated = orders.slice(start, start + itemsPerPage);
              return paginated.map((order) => (
                <div className="card" key={order._id}>
                  <div className="heading">
                    <div>
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className={`status-pill ${order.status}`}>{order.status}</div>
                  </div>
                  <p>Total: Rs. {order.total}</p>
                  {order.user && (
                    <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 4 }}>
                      <h4>User Details:</h4>
                      <p><strong>Name:</strong> {order.user.name}</p>
                      <p><strong>Email:</strong> {order.user.email}</p>
                      <p><strong>Contact:</strong> {order.user.contactNo || 'N/A'}</p>
                      <p><strong>Place:</strong> {order.user.place || 'N/A'}</p>
                      <p><strong>Address:</strong> {order.user.address || 'N/A'}</p>
                      <p><strong>State:</strong> {order.user.state || 'N/A'}</p>
                    </div>
                  )}
                  <div className="grid" style={{ gap: 6 }}>
                    {order.items.map((item, idx) => (
                      <div key={`${order._id}-${idx}`} className="badge">
                        <span>{item.product?.name || 'Product'}</span>
                        <span>x{item.quantity}</span>
                        <span>Rs. {item.priceAtPurchase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
            {Math.ceil(orders.length / itemsPerPage) > 1 && (
              <div className="pagination">
                {Array.from({ length: Math.ceil(orders.length / itemsPerPage) }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
