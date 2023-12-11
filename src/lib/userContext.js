import { createContext, useContext } from "react";

const UserContext = createContext();

export const useAuth = () => useContext(UserContext);

export default UserContext;
