import React from 'react';
import logo from "@/app/components/assets/insight.png"; // Tell webpack this JS file uses this image

console.log(logo); // /logo.84287d09.png

function Charimg() {
  // Import result is the URL of your image
  return (
    <div className="w-full h-2/1 bg-gray-500/[.85] p-1px rounded-lg">
      <img src={logo.src} alt="Logo" />
    </div>
  );
}

export default Charimg;