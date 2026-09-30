const Brand = require("../models/brand");
const Product = require("../models/product");

const {
    asyncHandler,
    fail,
    requireId,
    pagination,
} = require("../utils/http");


// Public brand browsing remains bounded and validates document IDs.
const getBrands = asyncHandler(async (req, res) => {
    const { limit, skip } = pagination(req);

    const brands = await Brand.find()
        .skip(skip)
        .limit(limit);

    res.json(brands);
});


const getBrandWithProducts = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(
        requireId(req.params.id)
    ).populate("products");

    if (!brand) {
        throw fail(404, "Brand not found.");
    }

    res.json(brand);
});


// Only whitelisted multipart fields can be created by an administrator.
const addBrand = asyncHandler(async (req, res) => {
    const unknownField = Object.keys(req.body).find(
        (field) => !["name", "slogan"].includes(field)
    );

    if (unknownField) {
        throw fail(
            400,
            "Unknown brand field: " + unknownField + "."
        );
    }

    const {
        name,
        slogan,
    } = req.body;
    const logo = req.file?.location || req.file?.path;

    if (
        ![name, slogan, logo].every(
            (value) => typeof value === "string" && value.trim()
        )
    ) {
        throw fail(
            400,
            "Name, slogan and one logo image are required."
        );
    }

    if (slogan.trim().length > 100) {
        throw fail(
            400,
            "Slogan cannot exceed 100 characters."
        );
    }

    const brand = await Brand.create({
        name: name.trim(),
        logo: logo.trim(),
        slogan: slogan.trim(),
    });

    res.status(201).json(brand);
});


const addProductsToBrands = asyncHandler(async (req, res) => {
    const brandId = requireId(req.body.brandId);
    const productId = requireId(req.body.productId);

    if (!await Product.exists({ _id: productId })) {
        throw fail(404, "Product not found.");
    }

    const brand = await Brand.findByIdAndUpdate(
        brandId,
        {
            $addToSet: {
                products: productId,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!brand) {
        throw fail(404, "Brand not found.");
    }

    res.json({
        message: "Product added to brand.",
        brand,
    });
});


module.exports = {
    getBrands,
    getBrandWithProducts,
    addBrand,
    addProductsToBrands,
};
