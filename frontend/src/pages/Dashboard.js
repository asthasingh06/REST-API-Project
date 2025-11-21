import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OrderList from '../components/OrderList';
import OrderForm from '../components/OrderForm';
import './Dashboard.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
  });
  const [users, setUsers] = useState([]);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchUsers();
    }
  }, [filters, isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

      const response = await axios.get(`/api/v1/orders?${params.toString()}`);
      setOrders(response.data.data.orders);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/v1/users');
      setUsers(response.data.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const response = await axios.post('/api/v1/orders', orderData);
      setOrders([response.data.data.order, ...orders]);
      setSuccess('Order created successfully');
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateOrder = async (id, orderData) => {
    try {
      const response = await axios.put(`/api/v1/orders/${id}`, orderData);
      setOrders(orders.map((order) => (order._id === id ? response.data.data.order : order)));
      setSuccess('Order updated successfully');
      setEditingOrder(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/orders/${id}`);
      setOrders(orders.filter((order) => order._id !== id));
      setSuccess('Order deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Order Management Dashboard</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingOrder(null);
          }}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Create Order'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {user?.role === 'admin' && (
        <div className="admin-badge">
          <strong>Admin Mode:</strong> You can view all users' orders
        </div>
      )}

      {showForm && (
        <OrderForm
          order={editingOrder}
          onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
          onCancel={handleFormCancel}
          users={users}
        />
      )}

      <div className="filters">
        <div className="form-group">
          <label htmlFor="status-filter">Filter by Status</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="payment-status-filter">Filter by Payment Status</label>
          <select
            id="payment-status-filter"
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading orders...</div>
      ) : (
        <OrderList
          orders={orders}
          onEdit={handleEditClick}
          onDelete={handleDeleteOrder}
          isAdmin={user?.role === 'admin'}
        />
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center">
          <p>No orders found. Create your first order!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

