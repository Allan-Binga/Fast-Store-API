import * as React from "react";

function InputField({ label, type, id }) {
  return (
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
}

export default InputField;
