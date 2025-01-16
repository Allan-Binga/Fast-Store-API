import * as React from "react";

const products = [
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/490cfe41ca51aec4f562ae8afd1f37ce9cf41e8de3105e4e8d917e31d5cbfe83?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    name: "The north coat",
    currentPrice: "260",
    originalPrice: "360",
    rating: "65",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/edb57f95acf618f7792687c3a75153374a05b25bc68e76f16c4a986a596e2b76?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    name: "Gucci duffle bag",
    currentPrice: "960",
    originalPrice: "1160",
    rating: "65",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/b44781562b635c634f0c89175de0b9aee38f59fca8f6567f106597316ccd7878?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    name: "RGB liquid CPU Cooler",
    currentPrice: "160",
    originalPrice: "170",
    rating: "65",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/d83b5e5b5d2a6a5e9340a92d503c0f5bc6d34ad05dfc687d3b2f10f75786c627?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    name: "Small BookSelf",
    currentPrice: "360",
    originalPrice: "480",
    rating: "65",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/d83b5e5b5d2a6a5e9340a92d503c0f5bc6d34ad05dfc687d3b2f10f75786c627?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    name: "Small BookSelf",
    currentPrice: "360",
    originalPrice: "480",
    rating: "65",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/b44781562b635c634f0c89175de0b9aee38f59fca8f6567f106597316ccd7878?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    name: "RGB liquid CPU Cooler",
    currentPrice: "160",
    originalPrice: "170",
    rating: "65",
  }
];

const ProductCards = ({ image, name, currentPrice, originalPrice, rating }) => {
  return (
    <div className="flex flex-col min-w-[240px] w-[270px] ">
      <img
        loading="lazy"
        src={image}
        alt={`Product image of ${name}`}
        className="object-contain max-w-full aspect-[1.08] w-[270px]"
      />
      <div className="flex flex-col self-start mt-4">
        <div className="text-black">{name}</div>
        <div className="flex gap-3 items-start self-start mt-2 whitespace-nowrap">
          <div className="text-red-500">${currentPrice}</div>
          {originalPrice && (
            <div className="text-black opacity-50">${originalPrice}</div>
          )}
        </div>
        <div className="flex gap-2 items-start mt-2 text-sm font-semibold text-black whitespace-nowrap">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f79bd71a6471f38d5d1fc5e45c151fa99346fc4a5342fd2b25d87f1e68ade395?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            alt=""
            className="object-contain shrink-0 aspect-[5] w-[100px]"
          />
          <div className="w-8 opacity-50">({rating})</div>
        </div>
      </div>
    </div>
  );
};

const BestSellers = () => {
  return (
    <div className="flex flex-col ml-[300px] mt-20">
      <div className="flex flex-wrap gap-10 items-end max-md:max-w-full">
        <div className="flex flex-col min-w-[240px]">
          <div className="flex gap-4 items-center self-start">
            <div className="flex flex-col self-stretch my-auto w-5">
              <div className="flex shrink-0 h-10 bg-red-500 rounded" />
            </div>
            <div className="self-stretch my-auto text-base font-semibold leading-none text-red-500">
              This Month
            </div>
          </div>
          <div className="mt-5 text-4xl font-semibold  leading-none text-black">
            Best Selling Products
          </div>
        </div>
        <button className="gap-2.5 px-12 py-4 text-base font-medium bg-red-500 rounded text-neutral-50  ml-[1100px]">
          View All
        </button>
      </div>
      <div className="flex flex-wrap gap-8 items-start mt-16 text-base font-medium max-md:mt-10 max-md:max-w-full">
        {products.map((product, index) => (
          <ProductCards key={index} {...product} />
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
