import React, { useEffect, useState } from "react";

const RecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const storedProducts =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    setRecentlyViewed(storedProducts);
  }, []);
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Recently Viewed</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentlyViewed.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-contain"
            />
            <h4 className="text-sm font-semibold mt-2">{product.name}</h4>
            <p className="text-blue-600 font-bold">${product.currentPrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
