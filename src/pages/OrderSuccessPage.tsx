import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface OrderDetails {
  id: number;
  created_at: string;
  total: number;
  status: string;
  items: {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product_name: string;
    product_image: string;
  }[];
}

const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id || !user) return;

      setIsLoading(true);
      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (orderError) {
          throw orderError;
        }

        // Fetch order items with product details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              image_url
            )
          `)
          .eq('order_id', id);

        if (itemsError) {
          throw itemsError;
        }

        // Format the data
        const formattedItems = itemsData.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product_name: item.products.name,
          product_image: item.products.image_url,
        }));

        setOrder({
          ...orderData,
          items: formattedItems,
        });
      } catch (error: any) {
        console.error('Error fetching order details:', error);
        setError(error.message || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full max-w-md mx-auto mb-8"></div>
          <div className="h-24 bg-gray-200 rounded-lg w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-8">{error || "We couldn't find the order you're looking for."}</p>
        <Link
          to="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Thank you for your order!</h1>
        <p className="mt-2 text-lg text-gray-600">
          Your order #{order.id} has been placed successfully.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          A confirmation email has been sent to your email address.
        </p>
      </div>

      <div className="mt-12 bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          <p className="mt-1 text-sm text-gray-500">
            Order placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-5 flex">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{item.product_name}</h3>
                      <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex justify-between text-sm">
            <p className="text-gray-500">Subtotal</p>
            <p className="text-gray-900">${(order.total / 1.1).toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <p className="text-gray-500">Tax</p>
            <p className="text-gray-900">${(order.total - order.total / 1.1).toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <p className="text-gray-500">Shipping</p>
            <p className="text-gray-900">Free</p>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-base font-medium text-gray-900">Total</p>
            <p className="text-base font-medium text-gray-900">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;