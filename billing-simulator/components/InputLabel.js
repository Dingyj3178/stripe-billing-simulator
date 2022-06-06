import React from "react";
import { InformationCircleIcon } from "@heroicons/react/solid";

function InputLabel({ labelName, tooltipContents }) {
  return (
    <div className="flex items-center ">
      <label
        htmlFor={labelName}
        className="block text-sm font-medium text-gray-700"
      >
        {labelName}
      </label>
      {tooltipContents ? (
        <div className="relative ml-1 group">
          <InformationCircleIcon className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700 " />
          {tooltipContents}
        </div>
      ) : null}
    </div>
  );
}

export default InputLabel;
