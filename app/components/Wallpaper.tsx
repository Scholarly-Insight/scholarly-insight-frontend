import React from 'react';
import logo from "@/app/wallpaper.jpg"; // Tell webpack this JS file uses this image

console.log(logo); // /logo.84287d09.png

function Wallpaper() {
  // Import result is the URL of your image
  return (
    <div className="w-full h-full">
      <img src={logo.src} alt="Logo" />
    </div>
  );
}

export default Wallpaper;