import axios from 'api/index';
import useAuth from './useAuth';
const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const refresh = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}refresh-token`).then((response) => {
            setAuth(prev => {
                return {
                    ...prev,
                    username: response.data.username,
                    avatar_path: response.data.avatar_path,
                    isLeading: response.data.isLeading,
                    color: response.data.color,
                    token: response.data.token,
                    isadmin: response.data.isadmin
                }
            }
            )
            return response.data.token;
        })
        return response
    }
    return refresh;
};

export default useRefreshToken;