import { email } from "better-auth/*";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
  try {
    const adminData = {
      name: "admin",
      email: "admin@gmail.com",
      role: UserRole.ADMIN,
      password: "admin123",
    };

    //check user exist or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: "iktushar2020@gmail.com",
      },
    });
    if (existingUser) {
      console.log("Admin user already exists");
      return;
    }
 
    const signUpAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email",{
      method : "POST",
      headers : {
        "content-type" : "application/json"
      },
      body : JSON.stringify(adminData)
    })

  } catch (error) {
    console.error(error);
  }
}
