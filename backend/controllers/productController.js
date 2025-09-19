import Product from '../models/Product.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// AI Description Generator
const generateAIDescription = (category, materials, title) => {
  const templates = [
    `Exquisite handcrafted ${category.toLowerCase()} made with premium ${materials}. This unique piece showcases traditional artistry combined with contemporary appeal. Each item is meticulously crafted using time-honored techniques passed down through generations.`,
    
    `Beautiful ${category.toLowerCase()} featuring intricate details and authentic craftsmanship. Created from high-quality ${materials} with careful attention to traditional methods. This piece represents the perfect fusion of cultural heritage and modern aesthetics.`,
    
    `Stunning ${title} crafted with traditional techniques using premium ${materials}. This ${category.toLowerCase()} exemplifies the artisan's skill and dedication to preserving cultural craftsmanship. Each piece tells a story of heritage and artistic excellence.`,
    
    `Handmade ${category.toLowerCase()} that combines traditional artistry with contemporary design. Crafted from ${materials} using ancient techniques, this piece represents authentic craftsmanship at its finest.`
  ];
  
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  const aiTags = [
    'handmade',
    'traditional',
    'authentic',
    'heritage',
    category.toLowerCase(),
    materials.toLowerCase().split(',')[0].trim(),
    'artisan-crafted',
    'unique'
  ].filter(tag => tag && tag.length > 2);
  
  return {
    description: randomTemplate,
    suggestedTags: aiTags
  };
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    console.log('Create product request received');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    if (!req.user || req.user.role !== 'artisan') {
      console.log('Access denied: Invalid user or role');
      return res.status(403).json({ error: 'Only artisans can create products' });
    }

    const {
      title,
      description,
      category,
      materials,
      size,
      price,
      stock,
      tags,
      customizationOptions,
      status = 'published'
    } = req.body;

    // Validate required fields
    if (!title || !category || !materials || !price || !stock) {
      console.log('Missing required fields:', { title, category, materials, price, stock });
      return res.status(400).json({ 
        error: 'Title, category, materials, price, and stock are required' 
      });
    }

    // For published products, description is required
    if (status === 'published' && !description) {
      return res.status(400).json({ 
        error: 'Description is required for published products' 
      });
    }

    // Parse JSON fields if they are strings
    let parsedTags = tags;
    let parsedCustomizationOptions = customizationOptions;
    
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        // If JSON parsing fails, treat as comma-separated string
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }
    
    if (typeof customizationOptions === 'string') {
      try {
        parsedCustomizationOptions = JSON.parse(customizationOptions);
      } catch (e) {
        // Default customization options if parsing fails
        parsedCustomizationOptions = { customizable: false, customizationNote: '' };
      }
    }

    // Handle image uploads
    const imageUrls = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

    // Parse numeric values
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    const productData = {
      title,
      description: description || undefined, // Allow empty description for drafts
      category,
      materials,
      size,
      price: parsedPrice,
      stock: parsedStock,
      images: imageUrls,
      tags: Array.isArray(parsedTags) ? parsedTags : parsedTags ? parsedTags.split(',').map(tag => tag.trim()) : [],
      customizationOptions: parsedCustomizationOptions || {},
      artisan: req.user._id,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const product = new Product(productData);
    console.log('About to save product:', productData);
    await product.save();
    console.log('Product saved successfully:', product._id);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Generate AI description
export const generateDescription = async (req, res) => {
  try {
    console.log('Generate description request received');
    console.log('Body:', req.body);
    
    const { category, materials, title } = req.body;
    
    if (!category || !materials) {
      console.log('Missing required fields:', { category, materials });
      return res.status(400).json({ error: 'Category and materials are required' });
    }

    const aiContent = generateAIDescription(category, materials, title || 'handcrafted item');
    
    res.json({
      description: aiContent.description,
      suggestedTags: aiContent.suggestedTags
    });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
};

// Get artisan's products
export const getArtisanProducts = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = 1, limit = 10, status, category } = req.query;
    const skip = (page - 1) * limit;

    const filter = { artisan: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('artisan', 'profile.name profile.businessName');

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get artisan products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get all products (public)
export const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      minPrice, 
      maxPrice, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { status: 'published' };

    // Add filters
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('artisan', 'profile.name profile.businessName profile.location');

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisan', 'profile.name profile.businessName profile.location profile.bio');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    product.statistics.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      artisan: req.user._id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle new image uploads
    const newImages = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    
    const updateData = { ...req.body };
    if (newImages.length > 0) {
      updateData.images = [...(product.images || []), ...newImages];
    }

    updateData.updatedAt = new Date();

    Object.assign(product, updateData);
    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      artisan: req.user._id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Get product categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { status: 'published' });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export {
  upload
};