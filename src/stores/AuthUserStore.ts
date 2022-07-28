import type { User } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";
import { authClient } from "@/helpers/8baseAuth";
import { apolloClient } from "@/graphql/apolloClient";

import currentUserQuery from "@/graphql/queries/currentUser.query.gql";
import userSignUpMutation from "@/graphql/mutations/userSignUp.mutation.gql";

const localStorageKey = "id_token";
const idToken = localStorage.getItem(localStorageKey);

export const useAuthUserStore = defineStore("AuthUserStore", {
  state: () => ({
    authenticated: !!idToken,
    idToken,
    user: null as User | null,
  }),
  actions: {
    login() {
      authClient.authorize();
    },

    async initUser() {
      if (!this.idToken) return;
      try {
        const res = await this.fetchUser(this.idToken as string);
        this.user = res.data.user;
      } catch (error) {
        console.log("no existing user watching id token");
      }
    },

    fetchUser(idToken: string) {
      const context = {
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      };
      return apolloClient.query({
        query: currentUserQuery,
        context,
      });
    },

    logout() {
      authClient.logout();
      this.authenticated = false;
      this.idToken = null;

      localStorage.removeItem(localStorageKey);
    },

    async handleAuthentication() {
      const authResult = await authClient.getAuthorizedData();

      /**
       * Check if user exists in 8base.
       */
      try {
        await this.fetchUser(authResult.idToken);
      } catch {
        /**
         * If user doesn't exist, an error will be
         * thrown, which then the new user can be
         * created using the authResult values.
         */

        try {
          await apolloClient.mutate({
            mutation: userSignUpMutation,
            variables: {
              user: {
                email: authResult.email,
                firstName: authResult.firstName,
                lastName: authResult.lastName,
                team: {
                  create: {
                    name: `${authResult.firstName}'s team`,
                  },
                },
              },
              authProfileId: import.meta.env.VITE_AUTH_PROFILE_ID,
            },
            context: {
              headers: {
                authorization: `Bearer ${authResult.idToken}`,
              },
            },
          });
        } catch (error) {
          // for some reason 8base is throwing an error here even though the signup is successful
          // refreshing the page makes everything work...
          window.location.pathname = "/";
        }
      }

      this.authenticated = true;
      this.idToken = authResult.idToken;

      localStorage.setItem(localStorageKey, authResult.idToken);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthUserStore, import.meta.hot));
}
