import Image from "next/image";

import background from "@/app/wallpaper.jpg";

import LoginBox from "@/app/components/LoginBox";

import Charimg from "@/app/components/Charimg";


export default function Home() {
  return (
    <div className="w-full h-full" style={{
      backgroundImage: "url(" + "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" + ")",
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      overflowY: "hidden"
    }}
    >
      <div className="w-full h-full flex flex-col gap-[10px] grid grid-cols-2 grid-rows-1">

        <div className="w-full h-1/2 flex flex-row gap-[10px] grid grid-cols-1 grid-rows-2">
          <div className="w-full h-1/5 bg-indigo-600/[.80] p-1 rounded-lg">
            <h1 className="text-3xl text-white font-sans text-center">Scholarly Insight</h1>
          </div>
          <Charimg></Charimg>            

        </div>
  
        <LoginBox></LoginBox>        

      </div>
    </div>
  );
}
