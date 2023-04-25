import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from 'hooks/useRefresh';
import useAuth from 'hooks/useAuth';
import './Try.css'
const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth, persist } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.token && persist ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [])

    return (
        <>
            {!persist
                ? <Outlet />
                : isLoading
                    ?   <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
                    : <Outlet />
            }
        </>
    )
}

export default PersistLogin