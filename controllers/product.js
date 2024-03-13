import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";
import { Category } from "../models/category.js";

export const getAllProducts = asyncError(async (req, res, next) => {

    const { keyword, category } = req.query;
  
    const products = await Product.find({
      name: {
        $regex: keyword ? keyword : "",//in regex for example we searching for macbook  if we search for mac it will appear
        $options: "i",
      },
      category: category ? category : undefined, 
    });
  
    res.status(200).json({
      success: true,
      products,
    });
  });

  export const getAdminProducts = asyncError(async (req, res, next) => {
    const products = await Product.find({}).populate("category");
  
    const outOfStock = products.filter((i) => i.stock === 0);
  
    res.status(200).json({
      success: true,
      products,
      outOfStock: outOfStock.length,
      inStock: products.length - outOfStock.length,
    });
  });

  export const getProductDetails = asyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate("category"); 
  
    if (!product) return next(new ErrorHandler("Product not found", 404)); 
  
    res.status(200).json({
      success: true,
      product,
    });
  });

  export const createProduct = asyncError(async (req, res, next) => {
    const { name, description, category, price, stock } = req.body;
  
    if (!req.file) return next(new ErrorHandler("Please add image", 400));
  
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  
    await Product.create({
      name,
      description,
      category,
      price,
      stock,
      images: [image],
    });
  
    res.status(200).json({
      success: true,
      message: "Product Created Successfully",
    });
  });

  export const updateProduct = asyncError(async (req, res, next) => {
    const { name, description, category, price, stock } = req.body;
  
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product not found", 404));
  
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (stock) product.stock = stock;
  
    await product.save();
  
    res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
    });
  });

  export const deleteProduct = asyncError(async (req, res, next) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  
      if (!deletedProduct) {
        return next(new ErrorHandler("Product not found", 404));
      }
  
      // If images are stored on cloudinary, you may want to delete them as well
  
      res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
        deletedProduct // Optionally return the deleted product
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      return next(new ErrorHandler("Error deleting product", 500));
    }
  });
  

  export const addProductImage = asyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product not found", 404));
  
    if (!req.file) return next(new ErrorHandler("Please add image", 400));
  
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  
    product.images.push(image);
    await product.save();
  
    res.status(200).json({
      success: true,
      message: "Image Added Successfully",
    });
  });

  export const deleteProductImage = asyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product not found", 404));
  
    const id = req.query.id;
  
    if (!id) return next(new ErrorHandler("Please Image Id", 400));
  
    let isExist = -1;
  
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
  
    if (isExist < 0) return next(new ErrorHandler("Image doesn't exist", 400));
  
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
  
    product.images.splice(isExist, 1);
  
    await product.save();
  
    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
    });
  }); 

  export const addCategory = asyncError(async (req, res, next) => {
    await Category.create(req.body);
  
    res.status(201).json({
      success: true,
      message: "Category Added Successfully",
    });
  });

  export const getAllCategories = asyncError(async (req, res, next) => {
    const categories = await Category.find({});
  
    res.status(200).json({
      success: true,
      categories,
    });
  });
  
  export const deleteCategory = asyncError(async (req, res, next) => { 
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler("Category Not Found", 404));
    const products = await Product.find({ category: category._id });
  
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }
  
    await Category.deleteOne({ _id: req.params.id });
  
    res.status(200).json({
      success: true,
      message: "Category Deleted Successfully",
    });
  });
