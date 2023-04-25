import { isExpired } from "react-jwt";

export function verifyToken(token) {
    if(isExpired(token) || !token) {
        return false;
    } else {
        return true;
    }
  }
  