import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders/customer/my-orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
        <div className="text-sm text-gray-600">
          Total Orders: {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <span className="text-5xl mb-4 block">📦</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Your orders will appear here after you make a purchase.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.pricing.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="mt-4 space-y-6">
                {/* Order Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Shipping Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <p>{selectedOrder.shippingAddress.name}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      <p className="mt-1">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center border-b border-gray-200 pb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.product.title}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          {item.customizations && (
                            <div className="mt-1 text-xs text-gray-500">
                              {item.customizations.color && <div>Color: {item.customizations.color}</div>}
                              {item.customizations.size && <div>Size: {item.customizations.size}</div>}
                              {item.customizations.material && <div>Material: {item.customizations.material}</div>}
                              {item.customizations.personalization && <div>Personalization: {item.customizations.personalization}</div>}
                              {item.customizations.notes && <div>Notes: {item.customizations.notes}</div>}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.pricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{formatPrice(selectedOrder.pricing.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatPrice(selectedOrder.pricing.tax)}</span>
                    </div>
                    {selectedOrder.pricing.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(selectedOrder.pricing.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.pricing.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {selectedOrder.tracking && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tracking Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Tracking Number</p>
                          <p className="text-sm font-medium">{selectedOrder.tracking.trackingNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Carrier</p>
                          <p className="text-sm font-medium">{selectedOrder.tracking.carrier || 'N/A'}</p>
                        </div>
                        {selectedOrder.tracking.estimatedDelivery && (
                          <div>
                            <p className="text-xs text-gray-500">Estimated Delivery</p>
                            <p className="text-sm font-medium">{formatDate(selectedOrder.tracking.estimatedDelivery)}</p>
                          </div>
                        )}
                        {selectedOrder.tracking.shippedDate && (
                          <div>
                            <p className="text-xs text-gray-500">Shipped Date</p>
                            <p className="text-sm font-medium">{formatDate(selectedOrder.tracking.shippedDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status History */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.timeline && selectedOrder.timeline.length > 0 ? (
                      selectedOrder.timeline.map((entry, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{entry.status}</p>
                            <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                            {entry.note && <p className="text-xs text-gray-500 mt-1">{entry.note}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No status updates yet</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;