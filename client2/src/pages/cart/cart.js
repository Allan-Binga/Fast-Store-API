import React from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FaRegTrashAlt } from "react-icons/fa";

const Cart = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />

      {/* Main content wrapper */}
      <main className="flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-6 h-10 bg-blue-500" />
            <h1 className="font-semibold text-secondary-2 text-4xl sm:text-5xl tracking-[0.02em] leading-[1.5]">
              Shopping Cart
            </h1>
          </div>

          {/* Checkout Main */}
          <div className="w-full max-w-[1200px] mx-auto">
            {/* Header Row */}
            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 text-left text-sm sm:text-base">
                <div className="font-semibold">Product</div>
                <div className="font-semibold">Price</div>
                <div className="font-semibold">Quantity</div>
                <div className="font-semibold">Subtotal</div>
              </div>

              {/* Product Rows */}
              <div className="grid grid-cols-5 gap-4 items-center p-4 border-b border-gray-200 text-sm sm:text-base">
                {/* Product Image and Details */}
                <div className="flex items-center gap-4">
                  <img
                    src="https://m.media-amazon.com/images/I/61iBtxCUabL._AC_SX522_.jpg"
                    alt="Product"
                    className="w-24 h-24 object-cover"
                  />
                  <div className="text-gray-700">Product Name</div>
                </div>
                {/* Price */}
                <div className="font-semibold">$50</div>
                {/* Quantity (Editable) */}
                <div>
                  <input
                    type="number"
                    defaultValue={1}
                    min={1}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                  />
                </div>
                {/* Subtotal */}
                <div className="font-semibold">$100</div>

                {/* Trash Icon */}
                <div className="text-right">
                  <FaRegTrashAlt className="text-gray-500 hover:text-red-600 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
