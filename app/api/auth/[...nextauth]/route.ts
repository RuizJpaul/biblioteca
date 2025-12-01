// Asegúrate de instalar next-auth: npm install next-auth
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Tipos para los parámetros
type JWTParams = { token: any; account: any; profile?: any };
type SessionParams = { session: any; token: any };

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  session: {  
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }: JWTParams) {
      if (account && profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = (profile as any).picture ?? "";
        // Validar si el usuario existe en la base de datos
        try {
          const res = await fetch(process.env.NEXTAUTH_URL + "/api/users?email=" + profile.email);
          const data = await res.json();
          if (!data || !data.user) {
            (token as any).notRegistered = true;
          }
        } catch (e) {
          (token as any).notRegistered = true;
        }
      }
      return token;
    },
    async session({ session, token }: SessionParams) {
      if (!session.user) session.user = {} as any;
      (session.user as any).email = token.email;
      (session.user as any).name = token.name;
      (session.user as any).image = token.picture;
      if ((token as any).notRegistered) {
        (session.user as any).notRegistered = true;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
