import React from 'react';
import './OrderItem.css';

const OrderItem = ({ order, onEdit, onDelete, isAdmin }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'payment-paid';
      case 'refunded':
        return 'payment-refunded';
      default:
        return 'payment-pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  return (
    <div className="order-item card">
      <div className="order-header">
        <div className="order-title-section">
          <h3>Order #{order.orderNumber}</h3>
          <p className="order-customer">
            {order.customerName} • {order.customerEmail}
          </p>
        </div>
        <div className="order-badges">
          <span className={`status-badge ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <span className={`payment-badge ${getPaymentStatusColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
          {isAdmin && order.priority && (
            <span className={`priority-badge ${getPriorityColor(order.priority)}`}>
              {order.priority}
            </span>
          )}
        </div>
      </div>

      <div className="order-content">
        <div className="order-items-preview">
          <strong>Items ({order.items?.length || 0}):</strong>
          {order.items && order.items.length > 0 ? (
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.productName} × {item.quantity} @ ${item.price?.toFixed(2) || '0.00'} = ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No items</p>
          )}
        </div>

        <div className="order-total-amount">
          <strong>Total: ${order.totalAmount?.toFixed(2) || '0.00'}</strong>
        </div>

        {order.notes && (
          <div className="order-notes">
            <strong>Notes:</strong> {order.notes}
          </div>
        )}

        {order.shippingAddress && (order.shippingAddress.street || order.shippingAddress.city) && (
          <div className="order-shipping">
            <strong>Shipping:</strong> {[
              order.shippingAddress.street,
              order.shippingAddress.city,
              order.shippingAddress.state,
              order.shippingAddress.zipCode,
              order.shippingAddress.country
            ].filter(Boolean).join(', ')}
          </div>
        )}
      </div>

      <div className="order-meta">
        {(isAdmin || order.createdBy) && (
          <small>
            Created by: {order.createdBy?.name || 'Unknown'}
            {order.createdBy?.email && ` (${order.createdBy.email})`}
          </small>
        )}
        {isAdmin && order.assignedTo && (
          <small className="order-assigned">
            Assigned to: {order.assignedTo?.name || 'Unknown'}
            {order.assignedTo?.email && ` (${order.assignedTo.email})`}
          </small>
        )}
        {isAdmin && order.estimatedDeliveryDate && (
          <small className="order-delivery-date">
            Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
          </small>
        )}
        {isAdmin && order.tags && order.tags.length > 0 && (
          <div className="order-tags">
            <small>Tags: </small>
            {order.tags.map((tag, index) => (
              <span key={index} className="tag-badge">{tag}</span>
            ))}
          </div>
        )}
        {isAdmin && order.adminNotes && (
          <div className="order-admin-notes">
            <small><strong>Admin Notes:</strong> {order.adminNotes}</small>
          </div>
        )}
        <small className="order-date">
          Created: {new Date(order.createdAt).toLocaleDateString()}
        </small>
      </div>

      <div className="order-actions">
        <button
          onClick={() => onEdit(order)}
          className="btn btn-secondary"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(order._id)}
          className="btn btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default OrderItem;


