/*
  # Initial Schema Setup

  1. New Tables
    - `products`
      - `id` (bigint, primary key)
      - `created_at` (timestamptz)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `category` (text)
      - `stock` (integer)
    
    - `profiles`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `email` (text)
      - `full_name` (text)
      - `address` (text, nullable)
      - `phone` (text, nullable)
    
    - `orders`
      - `id` (bigint, primary key)
      - `created_at` (timestamptz)
      - `user_id` (uuid, references profiles)
      - `status` (text)
      - `total` (numeric)
    
    - `order_items`
      - `id` (bigint, primary key)
      - `created_at` (timestamptz)
      - `order_id` (bigint, references orders)
      - `product_id` (bigint, references products)
      - `quantity` (integer)
      - `price` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  address text,
  phone text
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  total numeric(10,2) NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  order_id bigint REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id bigint REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Products: everyone can view, only authenticated admins can modify
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Profiles: users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Orders: users can view and create their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: users can view their own order items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'Electronics', 50),
('Smart Watch', 'Feature-rich smartwatch with health tracking', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Electronics', 30),
('Coffee Maker', 'Premium automatic coffee maker', 129.99, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'Home', 25),
('Desk Lamp', 'Modern LED desk lamp with adjustable brightness', 49.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', 'Home', 100),
('Leather Wallet', 'Genuine leather wallet with RFID protection', 79.99, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800', 'Accessories', 75),
('Sunglasses', 'Polarized sunglasses with UV protection', 159.99, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800', 'Accessories', 40);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();