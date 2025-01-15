import * as React from "react";
import ProductCard from "../productCard/productCard";
import CountdownTimer from "../countdown/countdown";

const products = [
  {
    id: 1,
    discount: "40",
    name: "HAVIT HV-G92 Gamepad",
    price: "120",
    originalPrice: "160",
    rating: "88",
    image: "https://cdn.builder.io/api/v1/image/assets/TEMP/8a1d4e026b481115b4e6f1d0189b00e17ec71ce4d6e6f7f8e41c8414d117b671?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    stars: "ext_6-"
  },
  {
    id: 2,
    discount: "35",
    name: "AK-900 Wired Keyboard",
    price: "960",
    originalPrice: "1160",
    rating: "75",
    image: "https://cdn.builder.io/api/v1/image/assets/TEMP/00a358e7-35e6-4dde-a819-58322c6c0bb4?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    stars: "ext_8-"
  },
  {
    id: 3,
    discount: "30",
    name: "IPS LCD Gaming Monitor",
    price: "370",
    originalPrice: "400",
    rating: "99",
    image: "https://cdn.builder.io/api/v1/image/assets/TEMP/f4fb4a190a78a53b9d61375f426460b46a2ffa0d4bfcc99be4de7df3895c49e5?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    stars: "ext_6-"
  },
  {
    id: 4,
    discount: "25",
    name: "S-Series Comfort Chair",
    price: "375",
    originalPrice: "400",
    rating: "99",
    image: "https://cdn.builder.io/api/v1/image/assets/TEMP/b3fc46f68ad112e4f8da715432f0cc95adc92f5a98db1bd8970a87f0062b1f8c?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    stars: "ext_11-"
  },
  {
    id: 5,
    discount: "25",
    name: "S-Series Comfort Chair",
    price: "375",
    originalPrice: "400",
    rating: "99",
    image: "https://cdn.builder.io/api/v1/image/assets/TEMP/746f4525797de51fad43a1b9fe651ca47bb19f024fd1f23d0b628dbbf444c135?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    stars: "ext_11-"
  },
  {
    id: 6,
    discount: "25",
    name: "S-Series Comfort Chair",
    price: "375",
    originalPrice: "400",
    rating: "99",
    image: "https://cdn.builder.io/api/v1/image/assets/TEMP/ca046a62429c37a5d23bb1958ac42ad182f0ee37fd489e5948612e413e1fc012?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
    stars: "ext_11-"
  }
];

function FlashSalesSection() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-10 items-end self-start max-md:max-w-full">
        <div className="flex flex-wrap gap-10 items-end min-w-[240px] max-md:max-w-full">
          <div className="flex flex-col h-[103px]">
            <div className="flex gap-4 items-center self-start">
              <div className="flex flex-col self-stretch my-auto w-5">
                <div className="flex shrink-0 h-10 bg-red-500 rounded" />
              </div>
              <div className="self-stretch my-auto text-base font-semibold leading-none text-red-500">
                Today's
              </div>
            </div>
            <div className="mt-6 text-4xl font-semibold tracking-widest leading-none text-black">
              Flash Sales
            </div>
          </div>
          <CountdownTimer />
        </div>
        <div className="flex gap-2 items-start">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6d46c131187bfff9eb633481579a064341b51d7196040ee40dd3f9577e445a5e?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            className="object-contain shrink-0 aspect-square w-[46px]"
            alt=""
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e88e31fcac886e936832d43b7fb2b7a3e219274da66d8e9d07a08a6cc7094c1b?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            className="object-contain shrink-0 aspect-square w-[46px]"
            alt=""
          />
        </div>
      </div>
      <div className="flex overflow-x-auto gap-8 items-start mt-10 w-full max-md:max-w-full">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}

export default FlashSalesSection;