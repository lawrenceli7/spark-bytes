import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { IAuthState, IAuthTokenDecoded } from "@/common/interfaces";
import jwt from "jsonwebtoken";

const initialState: IAuthState = {
  token: null,
  decodedToken: null,
};

interface IAuthContext {
  authState: IAuthState | undefined;
  getAuthState: () => IAuthState;
  updateAuthToken: (token: string) => void;
  clearAuthState: () => void;
  isAuthenticated: () => boolean;
}

// create a context for managing user state
export const AuthContext = createContext<IAuthContext>({
  authState: undefined,
  getAuthState: () => initialState,
  updateAuthToken: () => null,
  clearAuthState: () => null,
  isAuthenticated: () => false,
});

// hook to access to user state throughout the app
export function useAuth() {
  return useContext(AuthContext);
}

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  /**
   *
   * AuthContextProvider is a React component that provides an AuthContext to its children.
   * This context is used for managing user authentication state throughout the app.
   *
   * The context provides the following functions:
   * - getAuthState: Returns the current authentication state, which includes the JWT token and its decoded form.
   * - updateAuthToken: Updates the authentication state with a new JWT token. The token is also stored in local storage.
   * - clearAuthState: Clears the authentication state and removes the JWT token from local storage. This effectively logs the user out.
   * - isAuthenticated: Returns a boolean indicating whether the user is authenticated or not.
   */

  const [authState, setAuthState] = useState<IAuthState>(() => initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const authState = generateAuthStateFromToken(token);
      setAuthState(authState);
    }
  }, []);

  function generateAuthStateFromToken(token: string): IAuthState {
    /**
     * This function generates the auth state from the token
     * @param token string jwt token
     * @returns IAuthState
     */
    try {
      const decodedToken = jwt.decode(token) as IAuthTokenDecoded;
      const isTokenExpired = decodedToken.exp * 1000 < Date.now();

      return {
        token: isTokenExpired ? null : token,
        decodedToken: isTokenExpired ? null : decodedToken,
      };
    } catch (error) {
      console.error("Failed to generate auth state:", error);
      return {
        token: null,
        decodedToken: null,
      };
    }
  }
  const updateAuthToken = useCallback((token: string) => {
    /**
     * This function updates the auth state(state variable) from the token
     * @param token string jwt token
     * @returns void
     */
    const authState = generateAuthStateFromToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    setAuthState(authState);
  }, []);

  function clearAuthState() {
    /**
     * This function clears the auth state(state variable) and the token from the local storage
     * This logs the user out of the website
     * @returns void
     */
    setAuthState({
      token: null,
      decodedToken: null,
    });
    localStorage.removeItem("token");
  }

  const isAuthenticated = useCallback(() => {
    /**
     * This function checks if the user is authenticated
     *
     */
    const token = authState.token || localStorage.getItem("token");
    if (!token) {
      return false;
    }
    const decodedState = generateAuthStateFromToken(token);
    setAuthState(decodedState);
    if (!decodedState.decodedToken) {
      return false;
    }
    return decodedState.decodedToken.exp * 1000 > Date.now();
  }, [authState.token]);

  const getAuthState = () => {
    /**
     * This function gets the auth state
     * @returns authState
     */
    if (typeof window === "undefined") {
      return authState;
    }
    const token = authState.token || localStorage.getItem("token");
    if (!token) {
      return authState;
    }
    const decodedState = generateAuthStateFromToken(token);
    return decodedState;
  };

  // this allows childrens to access the user state
  return (
    <AuthContext.Provider
      value={{
        authState,
        getAuthState,
        updateAuthToken,
        clearAuthState,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
