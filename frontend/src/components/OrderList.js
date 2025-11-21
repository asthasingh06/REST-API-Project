import React from 'react';
import OrderItem from './OrderItem';
import './OrderList.css';

const OrderList = ({ orders, onEdit, onDelete, isAdmin }) => {
  if (orders.length === 0) {
    return <div className="text-center">No orders found.</div>;
  }

  return (
    <div className="order-list">
      {orders.map((order) => (
        <OrderItem
          key={order._id}
          order={order}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default OrderList;


