import * as React from "react";
import Countdown from "../countdown/countdown";
import ProductCard from "../productCard/productCard";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";

const products = [
  {
    id: 1,
    discount: "40",
    name: "HAVIT HV-G92 Gamepad",
    price: "120",
    originalPrice: "160",
    rating: "88",
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/8a1d4e026b481115b4e6f1d0189b00e17ec71ce4d6e6f7f8e41c8414d117b671?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
  },
  {
    id: 2,
    discount: "35",
    name: "AK-900 Wired Keyboard",
    price: "960",
    originalPrice: "1160",
    rating: "75",
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/ebab3538-6717-43cf-8e2b-53d46861d6fd?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
  },
  {
    id: 3,
    discount: "30",
    name: "IPS LCD Gaming Monitor",
    price: "370",
    originalPrice: "400",
    rating: "99",
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/f4fb4a190a78a53b9d61375f426460b46a2ffa0d4bfcc99be4de7df3895c49e5?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
  },
  {
    id: 4,
    discount: "25",
    name: "S-Series Comfort Chair",
    price: "375",
    originalPrice: "400",
    rating: "99",
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/b3fc46f68ad112e4f8da715432f0cc95adc92f5a98db1bd8970a87f0062b1f8c?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
  },
  {
    id: 5,
    discount: "25",
    name: "S-Series Comfort Chair",
    price: "375",
    originalPrice: "400",
    rating: "99",
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/746f4525797de51fad43a1b9fe651ca47bb19f024fd1f23d0b628dbbf444c135?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
  },
  {
    id: 6,
    discount: "25",
    name: "S-Series Comfort Chair",
    price: "375",
    originalPrice: "400",
    rating: "99",
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/ca046a62429c37a5d23bb1958ac42ad182f0ee37fd489e5948612e413e1fc012?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
  },
  {
    id: 7,
    discount: "40",
    name: "HAVIT HV-G92 Gamepad",
    price: "120",
    originalPrice: "160",
    rating: "88",
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/8a1d4e026b481115b4e6f1d0189b00e17ec71ce4d6e6f7f8e41c8414d117b671?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb",
  },
];

const ITEMS_ALLOWED = 5;

function FlashSales() {
  //carrousel
  const [startIndex, setStartIndex] = React.useState(0);

  //DISPLAYING VISIBLE PRODUCTS
  const visibleProducts = products.slice(
    startIndex,
    startIndex + ITEMS_ALLOWED
  );

  //RIGHT ARROW CLICK
  const handleNext = () => {
    setStartIndex((prevIndex) =>
      prevIndex + ITEMS_ALLOWED >= products.length
        ? 0
        : prevIndex + ITEMS_ALLOWED
    );
  };

   //RIGHT ARROW CLICK
   const handlePrev = () => {
    setStartIndex((prevIndex) =>
      prevIndex - ITEMS_ALLOWED < 0
        ? products.length - ITEMS_ALLOWED
        : prevIndex - ITEMS_ALLOWED
    );
  };
  return (
    <div className="inline-flex flex-col items-start gap-4 relative ml-[300px] mt-[35px]">
      <div className="inline-flex flex-col items-start gap-10 relative">
        <div className="inline-flex items-end gap-[470px] relative flex-[0_0_auto]">
          <div className="inline-flex items-end gap-[87px] relative flex-[0_0_auto]">
            <div className="inline-flex flex-col h-[103px] items-start gap-6 relative flex-[0_0_auto]">
              <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                <div className="flex flex-col self-stretch my-auto w-5">
                  <div className="flex shrink-0 h-10 bg-red-500 rounded" />
                </div>
                <div className="relative w-fit font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5] whitespace-nowrap">
                  Today’s Deals
                </div>
              </div>
              <div className="relative w-fit mb-[-8.00px] font-semibold text-text-2 text-[36px] tracking-[0.02em] leading-[1.2] whitespace-nowrap">
                Flash Sales
              </div>
            </div>
            <Countdown />
          </div>
          <div className="inline-flex items-center gap-4 relative flex-[0_0_auto] ml-[450px]">
            <FaArrowLeft className="w-6 h-6 text-black cursor-pointer" onClick={handlePrev}/>
            <FaArrowRight className="w-6 h-6 text-black cursor-pointer" onClick={handleNext}/>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-8 items-start mt-10 w-full max-md:max-w-full">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}

export default FlashSales;
