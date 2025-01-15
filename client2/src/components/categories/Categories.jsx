import * as React from "react";

const categories = [
  { name: "Phones", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/c4ba0495addf61025e5366b90f5fc2582c8b1d21bb4134b50ef337b2704a6367?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb", isActive: false },
  { name: "Computers", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/7f1c52df7046503763d0757130deac9040b4c2e75b3b103e2003eccf4c346316?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb", isActive: false },
  { name: "SmartWatch", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/e91b2f05bcf8c8c37d535f6ee9112ff3cb11cdff7c1c5d5bd2f2d9f9d9304917?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb", isActive: false },
  { name: "Camera", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/53fca3a6838b003056758175dc226f698b858cad8f0c66d09ec675f6bdab8186?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb", isActive: true },
  { name: "HeadPhones", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/391977d2c3eed9db350deb60cf4d5fab5ba062a648ac4a5e73766f02410f20af?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb", isActive: false },
  { name: "Gaming", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/09c66e31e5465fbd71efba5ffa05bb3d1c574e0ee0642d157c5b97428b7c5b4f?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb", isActive: false },
];

function CategorySection() {
  const CategoryHeader = () => (
    <div className="flex flex-wrap gap-10 items-end max-md:max-w-full">
      <div className="flex flex-col min-w-[240px]">
        <div className="flex gap-4 items-center self-start">
          <div className="flex flex-col self-stretch my-auto w-5">
            <div className="flex shrink-0 h-10 bg-red-500 rounded" />
          </div>
          <div className="self-stretch my-auto text-base font-semibold leading-none text-red-500">
            Categories
          </div>
        </div>
        <div className="mt-5 text-4xl font-semibold tracking-widest leading-none text-black">
          Browse By Category
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
  );

  const CategoryCard = ({ name, image, isActive }) => {
    const baseClasses = "flex overflow-hidden flex-col items-center px-9 py-6 rounded border border-solid w-[170px] max-md:px-5";
    const activeClasses = isActive ? "bg-red-500 shadow-sm text-neutral-50" : "border-black border-opacity-30 text-black";

    return (
      <div 
        className={`${baseClasses} ${activeClasses}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
          }
        }}
      >
        <img
          loading="lazy"
          src={image}
          alt={`${name} category icon`}
          className="object-contain w-14 aspect-square"
        />
        <div className="mt-4">{name}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <CategoryHeader />
      <div className="flex flex-wrap gap-8 items-start mt-16 text-base text-black whitespace-nowrap max-md:mt-10 max-md:max-w-full">
        {categories.map((category, index) => (
          <CategoryCard key={index} {...category} />
        ))}
      </div>
    </div>
  );
}

export default CategorySection;
