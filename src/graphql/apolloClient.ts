import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import { useAuthUserStore } from "@/stores/AuthUserStore";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: import.meta.env.HTTP_8BASE_API_LINK,
});

// Authorization Link
const setAuthorizationLink = setContext((req, prevCtx) => {
  const store = useAuthUserStore();
  return store.authenticated
    ? {
        ...prevCtx,
        headers: {
          authorization: `Bearer ${store.idToken}`,
        },
      }
    : prevCtx;
});

// Error Handling
const setErrorHandler = onError((error) => {
  const badToken = !!error.response?.errors.find(
    (e: { code: string }) =>
      e.code === "TokenExpiredErrro" || e.code === "InvalidTokenError"
  );
  if (badToken) {
    const store = useAuthUserStore();
    store.login();
  }
});

const cache = new InMemoryCache();

export const apolloClient = new ApolloClient({
  link: setAuthorizationLink.concat(setErrorHandler).concat(httpLink),
  cache,
});
