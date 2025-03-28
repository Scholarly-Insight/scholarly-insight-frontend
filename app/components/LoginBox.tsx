"use client";
import { useState } from "react";

import { createAccount } from "@/app/actions/loginHandle";
import { authAccount } from "@/app/actions/loginHandle";

function LoginBox(props: {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handle() {

    // alert(response);
    // alert("can we even print anything");

    const resp = await authAccount(email, password);

    if (resp == null) {
      alert("Login Failed");
    } else {
      alert("Login Success");
    }
  }

  return (
    <div className="h-1/4 w-1/2 flex-col justify-self-center p-4 text-gray-800 bg-gray-500/[.85] dark:text-white rounded-lg text-center mt-96">
      <h1 className="mb-4 text-2xl font-bold">Log In:</h1>
      <input type="text" name="email" id="email" placeholder="Email" className="border-b-4 border-indigo-500"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }} />
      <input type="password" name="password" id="password" placeholder="Password" className="border-b-4 border-indigo-500"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }} />

      <br></br>
      <br></br>

      <button
        type="submit"
        className="rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-indigo-700 hover:bg-indigo-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
        onClick={handle}
      >
        Log In
      </button>
    </div>
  );
}

export default LoginBox;
