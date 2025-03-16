//IMPORTS
const {
  getAllProducts,
  getLimitedProducts,
  addNewProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  addProductToCart,
} = require("../controllers/product");
const httpMocks = require("node-mocks-http");
const Product = require("../models/product");
const mongoose = require("mongoose");

//MOCK FUNCTION
jest.mock("../models/product");

describe("Products test controller", () => {
  let req, res;
  beforeEach(() => {
    //CLEAR MOCKS BEFORE EACH TEST
    jest.clearAllMocks();
  });

  //TESTING FOR GETTING ALL PRODUCTS
  it("should return all products", async () => {
    const mockProducts = [
      {
        rating: {
          rate: 4.8,
          count: 400,
        },
        _id: "6765610db82c77525e9c7cd7",
        title: "Mouse Pad",
        price: 200,
        category: "Office",
        description:
          "Description: White Big Mousepad for Gaming Large Topographic Map Washable Desk Pad with Stitched Edge Office Supplies and Decor",
      },
      {
        rating: {
          rate: 2.9,
          count: 470,
        },
        _id: "676561db47d90b0ab0dc12e2",
        title: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
        price: 109,
        description:
          "Easy upgrade for faster boot up, shutdown, application load and response (As compared to 5400 RPM SATA 2.5” hard drive; Based on published specifications and internal benchmarking tests using PCMark vantage scores) Boosts burst write performance, making it ideal for typical PC workloads The perfect balance of performance and reliability Read/write speeds of up to 535MB/s/450MB/s (Based on internal testing; Performance may vary depending upon drive capacity, host device, OS and application.)",
      },
    ];

    //MOCK MONGOOSE 'FIND' METHOD
    Product.find.mockResolvedValue(mockProducts);

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/products",
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getAllProducts(req, res, next);

    expect(Product.find).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockProducts);
    expect(next).not.toHaveBeenCalled();
  });

  //TESTING FOR GETTING A SINGLE PRODUCT
  it("should return a single product", async () => {
    const mockProduct = {
      rating: {
        rate: 4.8,
        count: 400,
      },
      _id: "12345",
      title: "Mouse Pad",
      price: 200,
      category: "Office",
      description:
        "Description: White Big Mousepad for Gaming Large Topographic Map Washable Desk Pad with Stitched Edge Office Supplies and Decor",
    };

    //MOCK MONGOOSE 'findById' method
    Product.findById.mockResolvedValue(mockProduct);

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/products/12345",
      params: {
        id: "12345",
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getSingleProduct(req, res, next);

    expect(Product.findById).toHaveBeenCalledWith("12345");
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockProduct);
    expect(next).not.toHaveBeenCalledWith();
  });

  //TESTING FOR ADDING A PRODUCT
  it("should add a product", async () => {
    const mockProduct = {
      name: "Gaming Chair",
      currentPrice: 300,
      originalPrice: 400, // Added this since it's required
      category: ["Furniture"],
      description: "Ergonomic gaming chair with lumbar support",
      image: "chair.jpg",
      reviews: {
        rate: 4.5,
        count: 120,
      },
    };

    req = httpMocks.createRequest({
      method: "POST",
      url: "/products",
      body: mockProduct,
    });
    res = httpMocks.createResponse();

    // MOCK THE SAVED DATA
    Product.prototype.save = jest.fn().mockResolvedValue({
      ...mockProduct,
      _id: "mock-id",
    });

    //CALLING addNewProduct FUNCTION WITH MOCK REQUEST AND RESPONSE OBJECTS.
    await addNewProduct(req, res);

    //ASSERTIONS
    expect(Product.prototype.save).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      ...mockProduct,
      _id: "mock-id",
    });
  });

  //TESTING FOR DELETING A PRODUCT
  it("should delete a product", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
      url: "/products/:id",
      params: { id: "123" },
    });

    const res = httpMocks.createResponse();

    //MOCK MONGOOSE'S 'findByIdAndDelete' METHODS
    Product.findById.mockResolvedValue({ _id: "123" });
    Product.findByIdAndDelete.mockResolvedValue(true);

    await deleteProduct(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(`Successfully deleted product 123`);
  });
});
