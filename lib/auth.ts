import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Simple auth - replace with proper user management later
        if (
          credentials.username === 'admin' &&
          credentials.password === 'admin123'
        ) {
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@janine.com',
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
