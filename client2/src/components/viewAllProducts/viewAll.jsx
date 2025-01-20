import * as React from "react";
import { useNavigate } from "react-router-dom";

export default function ViewAllProducts() {

  const navigate = useNavigate()
  return (
    <div className="flex justify-center items-center mt-[45px] mb-[45px]">
      <button className="bg-red-500 text-white text-lg font-medium py-3 px-6 rounded" onClick={() => navigate('/products')}>
        View All Products
      </button>
    </div>
  );
}
