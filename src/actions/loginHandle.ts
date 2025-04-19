"use server";

// Import app and auth from our shared Firebase service
import { app, auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Remove firebaseConfig and initialization

export async function createAccount(email: string, password: string) {
  try {
    // Use the shared auth instance
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Signed up 
    const user = userCredential.user;
    console.log("User Created");
    return user;
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("Error creating account:", errorMessage);
    return null;
  }
} 

export async function authAccount(email: string, password: string) {
  try {
    console.log("trying to auth with", email, password);
    // Use the shared auth instance
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Signed in 
    const user = userCredential.user;
    console.log("Signed in");
    return user;
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("Error signing in:", errorMessage);
    return null;
  }
} 