import React from "react";
import ProductCard from "./Productcard";

const products = [
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/e93d676010ab74579618dc0b96071fa06ce9ff5e74fe2432797646364b09ed4a?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "Breed Dry Dog Food",
    price: "100",
    rating: 4,
    ratingCount: "35",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/24636b4c4207a436ed854b7446b7b2c1f64e4f2cb0c68882ee1febd51294efdd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "CANON EOS DSLR Camera",
    price: "360",
    rating: 4,
    ratingCount: "95",
    hasAddToCart: true,
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/24636b4c4207a436ed854b7446b7b2c1f64e4f2cb0c68882ee1febd51294efdd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "CANON EOS DSLR Camera",
    price: "360",
    rating: 4,
    ratingCount: "95",
    hasAddToCart: true,
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/24636b4c4207a436ed854b7446b7b2c1f64e4f2cb0c68882ee1febd51294efdd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "CANON EOS DSLR Camera",
    price: "360",
    rating: 4,
    ratingCount: "95",
    hasAddToCart: true,
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/24636b4c4207a436ed854b7446b7b2c1f64e4f2cb0c68882ee1febd51294efdd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "CANON EOS DSLR Camera",
    price: "360",
    rating: 4,
    ratingCount: "95",
    hasAddToCart: true,
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/24636b4c4207a436ed854b7446b7b2c1f64e4f2cb0c68882ee1febd51294efdd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "CANON EOS DSLR Camera",
    price: "360",
    rating: 4,
    ratingCount: "95",
    hasAddToCart: true,
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/24636b4c4207a436ed854b7446b7b2c1f64e4f2cb0c68882ee1febd51294efdd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "CANON EOS DSLR Camera",
    price: "360",
    rating: 4,
    ratingCount: "95",
    hasAddToCart: true,
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/24636b4c4207a436ed854b7446b7b2c1f64e4f2cb0c68882ee1febd51294efdd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    title: "CANON EOS DSLR Camera",
    price: "360",
    rating: 4,
    ratingCount: "95",
    hasAddToCart: true,
  },
  // ... rest of products data
];

const OurProducts = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap gap-10 items-end max-md:max-w-full">
        <div className="flex flex-col min-w-[240px]">
          <div className="flex gap-4 items-center self-start">
            <div className="flex flex-col self-stretch my-auto w-5">
              <div className="flex shrink-0 h-10 bg-red-500 rounded" />
            </div>
            <div className="self-stretch my-auto text-base font-semibold leading-none text-red-500">
              Our Products
            </div>
          </div>
          <div className="mt-5 text-4xl font-semibold tracking-widest leading-none text-black">
            Explore Our Products
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6d46c131187bfff9eb633481579a064341b51d7196040ee40dd3f9577e445a5e?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            alt=""
            className="object-contain shrink-0 aspect-square w-[46px]"
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e88e31fcac886e936832d43b7fb2b7a3e219274da66d8e9d07a08a6cc7094c1b?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            alt=""
            className="object-contain shrink-0 aspect-square w-[46px]"
          />
        </div>
      </div>
      <div className="flex flex-col mt-16 max-md:mt-10 max-md:max-w-full">
        <div className="flex flex-wrap gap-8 items-start max-md:max-w-full">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurProducts;
