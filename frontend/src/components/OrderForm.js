import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './OrderForm.css';

const OrderForm = ({ order, onSubmit, onCancel, users = [] }) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ productName: '', quantity: 1, price: 0 }],
    status: 'pending',
    paymentStatus: 'pending',
    notes: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    assignedTo: '',
    adminNotes: '',
    priority: 'medium',
    tags: '',
    estimatedDeliveryDate: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        orderNumber: order.orderNumber || '',
        customerName: order.customerName || '',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        items: order.items && order.items.length > 0 ? order.items : [{ productName: '', quantity: 1, price: 0 }],
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        notes: order.notes || '',
        shippingAddress: order.shippingAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        assignedTo: order.assignedTo?._id || order.assignedTo || '',
        adminNotes: order.adminNotes || '',
        priority: order.priority || 'medium',
        tags: order.tags ? order.tags.join(', ') : '',
        estimatedDeliveryDate: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : '',
      });
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productName: '', quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      items: formData.items.filter(item => item.productName.trim() !== ''),
      totalAmount: calculateTotal(),
    };

    // Convert tags string to array
    if (submitData.tags) {
      submitData.tags = submitData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else {
      submitData.tags = [];
    }

    // Remove empty admin-only fields if not admin
    if (!isAdmin) {
      delete submitData.assignedTo;
      delete submitData.adminNotes;
      delete submitData.priority;
      delete submitData.tags;
      delete submitData.estimatedDeliveryDate;
    }

    // Clean up empty fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === null) {
        delete submitData[key];
      }
    });

    if (order) {
      onSubmit(order._id, submitData);
    } else {
      onSubmit(submitData);
    }
  };

  return (
    <div className="order-form-container">
      <div className="card">
        <h2 className="card-header">{order ? 'Edit Order' : 'Create New Order'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Order Number */}
          <div className="form-group">
            <label htmlFor="orderNumber">Order Number *</label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleChange}
              required
              maxLength={50}
              placeholder="ORD-2024-001"
            />
          </div>

          {/* Customer Information */}
          <div className="form-section-header">
            <h3>Customer Information</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customerName">Customer Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label htmlFor="customerEmail">Customer Email *</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="customerPhone">Customer Phone</label>
            <input
              type="text"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              maxLength={20}
            />
          </div>

          {/* Order Items */}
          <div className="form-section-header">
            <h3>Order Items</h3>
          </div>
          {formData.items.map((item, index) => (
            <div key={index} className="order-item-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={item.productName}
                  onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              {formData.items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="btn btn-danger btn-sm">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn btn-secondary btn-sm">
            Add Item
          </button>
          <div className="order-total">
            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
          </div>

          {/* Status */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Order Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="paymentStatus">Payment Status</label>
              <select id="paymentStatus" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="form-section-header">
            <h3>Shipping Address</h3>
          </div>
          <div className="form-group">
            <label htmlFor="shippingAddress.street">Street</label>
            <input
              type="text"
              id="shippingAddress.street"
              name="shippingAddress.street"
              value={formData.shippingAddress.street}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shippingAddress.city">City</label>
              <input
                type="text"
                id="shippingAddress.city"
                name="shippingAddress.city"
                value={formData.shippingAddress.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="shippingAddress.state">State</label>
              <input
                type="text"
                id="shippingAddress.state"
                name="shippingAddress.state"
                value={formData.shippingAddress.state}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shippingAddress.zipCode">Zip Code</label>
              <input
                type="text"
                id="shippingAddress.zipCode"
                name="shippingAddress.zipCode"
                value={formData.shippingAddress.zipCode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="shippingAddress.country">Country</label>
              <input
                type="text"
                id="shippingAddress.country"
                name="shippingAddress.country"
                value={formData.shippingAddress.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              maxLength={500}
            />
          </div>

          {/* Admin-only fields */}
          {isAdmin && (
            <>
              <div className="admin-fields-separator">
                <h4>Admin-Only Fields</h4>
              </div>
              <div className="form-group">
                <label htmlFor="assignedTo">Assign To User</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</label>
                  <input
                    type="date"
                    id="estimatedDeliveryDate"
                    name="estimatedDeliveryDate"
                    value={formData.estimatedDeliveryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., urgent, vip, bulk"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminNotes">Admin Notes</label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  value={formData.adminNotes}
                  onChange={handleChange}
                  rows="3"
                  maxLength={1000}
                  placeholder="Internal notes visible only to admins"
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {order ? 'Update Order' : 'Create Order'}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;


