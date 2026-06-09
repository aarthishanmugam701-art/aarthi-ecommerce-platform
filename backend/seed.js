import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life.',
    price: 149.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    stock: 50,
    rating: 4.5,
    numReviews: 128,
    tags: ['audio', 'wireless', 'premium'],
  },
  {
    name: 'Smart Watch Pro',
    description: 'Fitness tracking, heart rate monitor, and GPS built-in.',
    price: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    stock: 35,
    rating: 4.7,
    numReviews: 89,
    tags: ['wearable', 'fitness', 'smart'],
  },
  {
    name: 'Classic Cotton T-Shirt',
    description: 'Soft organic cotton tee available in multiple colors.',
    price: 29.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    stock: 200,
    rating: 4.2,
    numReviews: 256,
    tags: ['casual', 'cotton', 'basics'],
  },
  {
    name: 'Denim Jacket',
    description: 'Vintage-style denim jacket with modern fit.',
    price: 79.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1551028711-00167b16eac5?w=400',
    stock: 45,
    rating: 4.4,
    numReviews: 67,
    tags: ['denim', 'outerwear', 'casual'],
  },
  {
    name: 'JavaScript: The Definitive Guide',
    description: 'Comprehensive guide to JavaScript programming.',
    price: 49.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012197268-da84d127e765?w=400',
    stock: 80,
    rating: 4.8,
    numReviews: 312,
    tags: ['programming', 'javascript', 'tech'],
  },
  {
    name: 'The Art of Clean Code',
    description: 'Best practices for writing maintainable software.',
    price: 39.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    stock: 60,
    rating: 4.6,
    numReviews: 198,
    tags: ['programming', 'software', 'tech'],
  },
  {
    name: 'Ceramic Plant Pot Set',
    description: 'Set of 3 minimalist ceramic pots for indoor plants.',
    price: 34.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
    stock: 90,
    rating: 4.3,
    numReviews: 45,
    tags: ['decor', 'plants', 'minimalist'],
  },
  {
    name: 'LED Desk Lamp',
    description: 'Adjustable brightness with USB charging port.',
    price: 45.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    stock: 70,
    rating: 4.5,
    numReviews: 92,
    tags: ['lighting', 'office', 'modern'],
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip eco-friendly yoga mat with carrying strap.',
    price: 59.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    stock: 55,
    rating: 4.6,
    numReviews: 134,
    tags: ['fitness', 'yoga', 'eco'],
  },
  {
    name: 'Running Shoes Ultra',
    description: 'Lightweight running shoes with responsive cushioning.',
    price: 119.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    stock: 40,
    rating: 4.7,
    numReviews: 201,
    tags: ['running', 'footwear', 'performance'],
  },
  {
    name: 'Organic Face Serum',
    description: 'Vitamin C serum for brightening and anti-aging.',
    price: 42.99,
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1620916566998-39fb5780d5bb?w=400',
    stock: 65,
    rating: 4.4,
    numReviews: 78,
    tags: ['skincare', 'organic', 'vitamin-c'],
  },
  {
    name: 'Luxury Lipstick Set',
    description: 'Set of 5 long-lasting matte lipsticks.',
    price: 54.99,
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    stock: 8,
    rating: 4.5,
    numReviews: 56,
    tags: ['makeup', 'luxury', 'gift'],
  },
];

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce';
    await mongoose.connect(uri);

    await Product.deleteMany({});
    await User.deleteMany({});

    await Product.insertMany(products);

    await User.create({
      name: 'Admin User',
      email: 'admin@shop.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'Demo User',
      email: 'user@shop.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Database seeded successfully!');
    console.log('Admin: admin@shop.com / admin123');
    console.log('User:  user@shop.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
