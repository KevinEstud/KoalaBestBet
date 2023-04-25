/*!

=========================================================
* Vision UI Free Chakra - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-chakra
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-chakra/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useNavigate } from "react-router-dom";
import useLogout from "hooks/useLogout";
// Chakra imports
import { useEffect } from "react";
import useTchat from "hooks/useTchat";
function Logout() {
    const navigate = useNavigate;
    const logout = useLogout();
    const { socket } = useTchat()
    const signOut = async () => {
        await logout();
        localStorage.clear();
    }
    useEffect(() => {
        document.title = "KoalaBestBet - Déconnexion"
        signOut()
        if(socket) {
            socket.disconnect()
        }
       return () => {

       }
    },[])
    return navigate("/auth/signin")
}

export default Logout;
