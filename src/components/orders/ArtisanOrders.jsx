import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackingModal from './TrackingModal';

const ArtisanOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders/artisan/my-orders');
      setOrders(response.data.orders || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again later.');
      setOrders([]); // Ensure orders is an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, trackingInfo = null) => {
    try {
      const updateData = { status };
      
      if (trackingInfo) {
        updateData.tracking = trackingInfo;
      }
      
      // Use the artisan-specific endpoint
      const response = await axios.put(`/orders/${orderId}/status/artisan`, updateData);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, ...response.data.order } 
            : order
        )
      );
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...response.data.order });
      }
      
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAcceptOrder = (order) => {
    updateOrderStatus(order._id, 'confirmed');
  };

  const handleMarkInProgress = (order) => {
    updateOrderStatus(order._id, 'processing');
  };

  const handleMarkShipped = (order) => {
    setOrderToUpdate(order);
    setIsTrackingModalOpen(true);
  };

  const handleMarkDelivered = (order) => {
    updateOrderStatus(order._id, 'delivered');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleTrackingSubmit = async (trackingInfo) => {
    try {
      // First update the status to 'shipped'
      await updateOrderStatus(orderToUpdate._id, 'shipped');
      
      // Then update the tracking information
      const response = await axios.put(`/orders/${orderToUpdate._id}/status/artisan`, {
        status: 'shipped',
        tracking: {
          ...trackingInfo,
          shippedDate: new Date()
        }
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderToUpdate._id 
            ? { ...order, ...response.data.order } 
            : order
        )
      );
      
      if (selectedOrder && selectedOrder._id === orderToUpdate._id) {
        setSelectedOrder({ ...selectedOrder, ...response.data.order });
      }
      
      setIsTrackingModalOpen(false);
      setOrderToUpdate(null);
      alert('Order marked as shipped with tracking information');
    } catch (error) {
      console.error('Error updating tracking information:', error);
      alert('Failed to update tracking information: ' + (error.response?.data?.error || error.message));
    }
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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <div className="text-sm text-gray-600">
          Total Orders: {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <span className="text-5xl mb-4 block">📦</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders from customers will appear here when they purchase your products.</p>
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
                    Customer
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
                      <div className="text-sm text-gray-900">{order.customer?.name || 'Customer'}</div>
                      <div className="text-sm text-gray-500">{order.customer?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.pricing?.total ? formatPrice(order.pricing.total) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptOrder(order)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Accept
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleMarkInProgress(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Start Work
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleMarkShipped(order)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => handleMarkDelivered(order)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Delivered
                        </button>
                      )}
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
                    Placed on {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'N/A'}
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

                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedOrder.customer?.name || 'Customer'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer?.email || 'N/A'}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{selectedOrder.shippingAddress?.name || 'N/A'}</p>
                      <p>{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                      <p>{selectedOrder.shippingAddress?.city || 'N/A'}, {selectedOrder.shippingAddress?.state || 'N/A'} {selectedOrder.shippingAddress?.zipCode || 'N/A'}</p>
                      <p>{selectedOrder.shippingAddress?.country || 'N/A'}</p>
                      <p className="mt-1">Phone: {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center border-b border-gray-200 pb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.product ? item.product.title : 'Product not available'}
                          </p>
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
                          {item.price ? formatPrice(item.price * item.quantity) : 'Price not available'}
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
                      <span>{selectedOrder.pricing?.subtotal ? formatPrice(selectedOrder.pricing.subtotal) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{selectedOrder.pricing?.shipping ? formatPrice(selectedOrder.pricing.shipping) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{selectedOrder.pricing?.tax ? formatPrice(selectedOrder.pricing.tax) : 'N/A'}</span>
                    </div>
                    {selectedOrder.pricing?.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{selectedOrder.pricing?.discount ? formatPrice(selectedOrder.pricing.discount) : 'N/A'}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>{selectedOrder.pricing?.total ? formatPrice(selectedOrder.pricing.total) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

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
                            <p className="text-xs text-gray-500">{entry.timestamp ? formatDate(entry.timestamp) : 'N/A'}</p>
                            {entry.note && <p className="text-xs text-gray-500 mt-1">{entry.note}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No status updates yet</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleAcceptOrder(selectedOrder);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Accept Order
                    </button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        handleMarkInProgress(selectedOrder);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Start Work
                    </button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button
                      onClick={() => {
                        handleMarkShipped(selectedOrder);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => {
                        handleMarkDelivered(selectedOrder);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark as Delivered
                    </button>
                  )}
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

      {/* Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setOrderToUpdate(null);
        }}
        onSubmit={handleTrackingSubmit}
        order={orderToUpdate}
      />
    </div>
  );
};

export default ArtisanOrders;