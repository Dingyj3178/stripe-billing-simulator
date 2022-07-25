import React from "react";
import type { NextPage } from "next";
import HowToUseDoc from "./HowToUseDoc.mdx";

import Navbar from "../../components/Navbar";

const HowToUse: NextPage = () => {
  return (
    <>
      <Navbar />
      <div className="prose prose-indigo prose-sm sm:prose-base lg:prose-xl mt-5 max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-5xl  mx-auto">
        <HowToUseDoc />
        {/* test */}
      </div>
    </>
  );
};

export default HowToUse;
