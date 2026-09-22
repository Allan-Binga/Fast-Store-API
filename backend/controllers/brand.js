const Brand = require("../models/brand");
const Product = require("../models/product");
const { asyncHandler, fail, requireId, pagination } = require("../utils/http");

// Public brand browsing remains bounded and validates document IDs.
const getBrands = asyncHandler(async (req, res) => { const { limit, skip } = pagination(req); res.json(await Brand.find().skip(skip).limit(limit)); });
const getBrandWithProducts = asyncHandler(async (req, res) => { const brand = await Brand.findById(requireId(req.params.id)).populate("products"); if (!brand) throw fail(404, "Brand not found."); res.json(brand); });
// Only whitelisted brand fields can be created by an administrator.
const addBrand = asyncHandler(async (req, res) => {
  const { name, logo, slogan } = req.body;
  if (![name, logo, slogan].every(v => typeof v === "string" && v.trim())) throw fail(400, "Name, logo and slogan are required.");
  res.status(201).json(await Brand.create({ name, logo, slogan }));
});
const addProductsToBrands = asyncHandler(async (req, res) => {
  const brandId = requireId(req.body.brandId), productId = requireId(req.body.productId);
  if (!await Product.exists({ _id: productId })) throw fail(404, "Product not found.");
  const brand = await Brand.findByIdAndUpdate(brandId, { $addToSet: { products: productId } }, { new: true, runValidators: true });
  if (!brand) throw fail(404, "Brand not found.");
  res.json({ message: "Product added to brand.", brand });
});
module.exports = { getBrands, getBrandWithProducts, addBrand, addProductsToBrands };
