import * as React from "react";

function ProductCard({ discount, name, price, originalPrice, rating, image }) {
  return (
    <div className="flex flex-col min-w-[240px] w-[270px]">
      <div className="flex overflow-hidden gap-1 items-start px-3 pt-3 pb-12 max-w-full rounded bg-neutral-100 w-[270px]">
        <div className="flex flex-col text-xs whitespace-nowrap text-neutral-50">
          {discount && (
            <div className="gap-2.5 self-start px-3 py-1 bg-red-500 rounded">
              -{discount}%
            </div>
          )}
          <img
            loading="lazy"
            src={image}
            className="object-contain self-end mt-3 max-w-full aspect-[1.13] w-[172px]"
            alt={name}
          />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/00d93adab53c5214ab1a164999c542db25c2e68622e0085e7c9140fbeae9a9e5?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            className="object-contain aspect-square w-[34px]"
            alt=""
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/92f95af307a693492ef165c4482565d88008392560df9e3855fc15ed6903d028?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            className="object-contain aspect-square w-[34px]"
            alt=""
          />
        </div>
      </div>
      <div className="flex flex-col items-start self-start mt-4 text-base font-medium">
        <div className="self-stretch text-black">{name}</div>
        <div className="flex gap-3 items-start mt-2 whitespace-nowrap">
          <div className="text-red-500">${price}</div>
          {originalPrice && (
            <div className="text-black opacity-50">${originalPrice}</div>
          )}
        </div>
        <div className="flex gap-2 items-start mt-2 text-sm font-semibold text-black whitespace-nowrap">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f79bd71a6471f38d5d1fc5e45c151fa99346fc4a5342fd2b25d87f1e68ade395?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
            className="object-contain shrink-0 aspect-[5] w-[100px]"
            alt={`${rating} out of 5 stars`}
          />
          <div className="w-8 opacity-50">({rating})</div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
