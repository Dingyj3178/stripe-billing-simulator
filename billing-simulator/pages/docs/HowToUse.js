import React from "react";
import HowToUseDoc from "./HowToUseDoc.mdx";

import Navbar from "../../components/Navbar";

function HowToUse() {
  return (
    <>
      <Navbar />
      <div className="prose prose-indigo prose-sm sm:prose-base lg:prose-xl mt-5 max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-5xl  mx-auto">
        <HowToUseDoc />
      </div>
    </>
  );
}

export default HowToUse;
