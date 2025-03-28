"use server";

import { initializeApp } from "firebase/app";

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyD319eb4sz5ylo8oAjnx-d5iGpQxI5qUJ0",

  authDomain: "scholarly-insight-2908.firebaseapp.com",

  projectId: "scholarly-insight-2908",

  storageBucket: "scholarly-insight-2908.firebasestorage.app",

  messagingSenderId: "866222025259",

  appId: "1:866222025259:web:855709c06548e9c936d86e",

  measurementId: "G-J5H0MX5E67"

};

const app = initializeApp(firebaseConfig);

export async function createAccount(email: string, password: string) {
  // Initialize Firebase


  // const analytics = getAnalytics(app);



  const auth = getAuth();
  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;

      console.log("User Created");
      // ...

      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log("error"+errorMessage);
      // ..

      return null;
    });
} 



export async function authAccount(email: string, password: string) {
  // Initialize Firebase

  console.log("trying to auth with", email, password);


  // const analytics = getAnalytics(app);


  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;

    console.log("Signed in");

    return user;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("error"+errorMessage);

    return null;
  });
} 