import CredentialsProvider from "next-auth/providers/credentials";

export const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Add your logic to authenticate the user here.
        // You can fetch from your database or external service.
        if (
          credentials?.email === "themaytech-m27@gmail.com" &&
          credentials?.password === "themaytect@m27"
        ) {
          return {
            id: "1",
            name: "Themaytech-m27",
            email: "themaytech-m27@gmail.com",
          };
        }
        return null; // Authentication failed
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
  },
};
