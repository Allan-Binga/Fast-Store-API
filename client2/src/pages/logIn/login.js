import * as React from "react";

const formFields = [
  { label: "Email or Phone Number", type: "text", id: "email" },
  { label: "Password", type: "password", id: "password" },
];

function LoginForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-wrap gap-10 items-center">
      <div className="flex overflow-hidden flex-col self-stretch pt-20 my-auto rounded-none bg-slate-300 min-w-[240px] w-[805px] max-md:max-w-full">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/69e0f745a386da13ccf8560b79d75248221409e03e50215b2e917c121088ed4b?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
          alt=""
          className="object-contain w-full aspect-[1.14] max-md:max-w-full"
        />
      </div>
      <div className="flex flex-col self-stretch my-auto min-w-[240px]">
        <div className="flex flex-col max-w-full w-[370px]">
          <div className="flex flex-col self-start text-black">
            <h1 className="text-4xl font-medium tracking-widest leading-none">
              Log in to FastStore
            </h1>
            <p className="mt-6 text-base">Enter your details below</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col mt-12 w-full max-md:mt-10"
          >
            {formFields.map((field) => (
              <InputField
                key={field.id}
                label={field.label}
                type={field.type}
                id={field.id}
              />
            ))}
            <div className="flex gap-10 items-center mt-10 text-base">
              <button
                type="submit"
                className="flex flex-col self-stretch my-auto font-medium text-neutral-50"
              >
                <span className="gap-2.5 self-stretch px-12 py-4 bg-red-500 rounded max-md:px-5">
                  Log In
                </span>
              </button>
              <button
                type="button"
                className="self-stretch my-auto text-red-500"
                tabIndex="0"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

const InputField = ({ label, type = "text", id }) => (
  <div className="flex flex-col mt-10 w-full">
    <label htmlFor={id} className="text-base text-black opacity-40">
      {label}
    </label>
    <div className="flex flex-col mt-2 w-full">
      <input
        type={type}
        id={id}
        name={id}
        className="w-full border-b border-black"
        aria-label={label}
        required
      />
    </div>
  </div>
);
