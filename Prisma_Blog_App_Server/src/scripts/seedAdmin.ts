import { email } from "better-auth/*";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
  try {
    const adminEmail = "admin10@gmail.com";

    const adminData = {
      name: "admin",
      email: adminEmail,
      role: UserRole.ADMIN,
      password: "admin123",
      emailVerified: true,
    };

    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingUser) {
      console.log("Admin user already exists");
      return;
    }

    const signUpAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:5000", // 🔥 REQUIRED
        },
        credentials: "include",
        body: JSON.stringify(adminData),
      },
    );

    if(signUpAdmin.ok){
      await prisma.user.update(
        {
          where : {
            email: adminData.email
          },
          data: {
            emailVerified : true
          }
        }
      )
    }

    const data = await signUpAdmin.json();
    console.log(data);



    // create admin
    // email verified false
    //
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
