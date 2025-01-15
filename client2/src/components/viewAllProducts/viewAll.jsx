import * as React from "react";

export default function ViewAllProducts() {
  return (
    <div className="flex justify-center items-center">
      <button
        className="px-6 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        type="button"
        aria-label="View all products"
      >
        View All Products
      </button>
    </div>
  );
}
