import { useState, useEffect, useCallback } from 'react';
import { requestForToken } from './firebase';
import { toast } from 'react-toastify';

export function useTokenManagement() {
    const [token, setToken] = useState(null);

    const sendTokenToServer = useCallback(async (newToken, username, orders) => {
        try {
            const response = await fetch('http://localhost:8080/api/notice/save-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: newToken, username }),
            });
            if (response.ok) {
                console.log('Token sent to server successfully');
            } else {
                console.error('Failed to send token to server');
            }
        } catch (error) {
            console.error('Error sending token to server:', error);
        }
    }, []);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const newToken = await requestForToken();
                if (newToken && newToken !== token) {
                    setToken(newToken);
                    // Note: We're not automatically sending the token to the server here
                    // because we don't have username and orders at this point
                }
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        fetchToken();
        // 주기적으로 토큰을 새로 고치는 로직 추가
        const tokenRefreshInterval = setInterval(fetchToken, 60 * 60 * 1000); // 예: 1시간마다

        return () => clearInterval(tokenRefreshInterval);
    }, [token]);

    return { token, sendTokenToServer };
}