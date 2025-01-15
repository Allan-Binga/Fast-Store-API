import * as React from "react";

function ProductCard({ image, title, price, rating, ratingCount, isNew, colors, hasAddToCart }) {
  return (
    <div className="flex flex-col min-w-[240px] w-[270px]">
      <div className={`${hasAddToCart ? 'flex overflow-hidden flex-col pt-3 w-full rounded bg-neutral-100 max-w-[270px]' : ''}`}>
        {isNew && (
          <div className="gap-2.5 self-start px-3 py-1 bg-green-500 rounded text-xs text-neutral-50">
            NEW
          </div>
        )}
        <img
          loading="lazy"
          src={image}
          alt={title}
          className="object-contain max-w-full aspect-[1.08] w-[270px]"
        />
        {hasAddToCart && (
          <div className="px-7 py-2.5 mt-6 text-base font-medium text-white bg-black rounded-none max-md:px-5">
            Add To Cart
          </div>
        )}
      </div>
      <div className="flex flex-col self-start mt-4">
        <div className="text-base font-medium text-black">{title}</div>
        <div className="flex gap-2 items-center mt-2 whitespace-nowrap">
          <div className="gap-3 self-stretch my-auto text-base font-medium text-red-500">
            ${price}
          </div>
          <div className="flex gap-2 items-start self-stretch my-auto text-sm font-semibold text-black">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c35d903ef32712f74f1d691c7776b06b738b9c9c861a4482d47d9f9e4b9b6d4a?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
              alt=""
              className="object-contain shrink-0 aspect-[5] w-[100px]"
            />
            <div className="w-10 opacity-50">({ratingCount})</div>
          </div>
        </div>
        {colors && (
          <div className="flex gap-2 items-start self-start mt-2">
            {colors.map((color, index) => (
              <div key={index} className="flex flex-col w-5">
                <div className="flex flex-col justify-center items-center px-0.5 w-5 h-5 rounded-full border-2 border-black border-solid">
                  <div className={`flex shrink-0 w-3 h-3 ${color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;