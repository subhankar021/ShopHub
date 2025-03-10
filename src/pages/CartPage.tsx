import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import CartItem from '../components/CartItem';

const CartPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
        <p className="mt-1 text-sm text-gray-500">
          Looks like you haven't added any products to your cart yet.
        </p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <Link
          to="/products"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          <div className="border-t border-gray-200 divide-y divide-gray-200">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={() => clearCart()}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="mt-10 lg:mt-0 lg:col-span-5">
          <div className="bg-gray-50 rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-sm font-medium text-gray-900">
                  ${totalPrice().toFixed(2)}
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">Shipping</div>
                <div className="text-sm font-medium text-gray-900">Free</div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">Tax</div>
                <div className="text-sm font-medium text-gray-900">
                  ${(totalPrice() * 0.1).toFixed(2)}
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4">
                <div className="text-base font-medium text-gray-900">Order Total</div>
                <div className="text-base font-medium text-gray-900">
                  ${(totalPrice() * 1.1).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {user ? (
                <Link
                  to="/checkout"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <Link
                  to="/login?redirect=/checkout"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Login to Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;