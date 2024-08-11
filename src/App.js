import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onMessageListener, requestForToken } from './firebase';
import { useTokenManagement } from "./useTokenManagement";

function App() {
    const [username, setUsername] = useState('');
    const [orders, setOrders] = useState('');
    const [notification, setNotification] = useState({title: '', body: ''});
    const { token, sendTokenToServer } = useTokenManagement();

    // 알림 동의를 눌렀을 때 requestForToken이 실행되도록 해야 함
    useEffect(() => {
        requestForToken().then(currentToken => {
            console.log('Token received:', currentToken);
        });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, orders }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('User registered successfully:', result);
                if (token) {
                    await sendTokenToServer(token, username, orders);
                } else {
                    console.warn('No token available. Unable to send to server.');
                }
            } else {
                console.error('User registration failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    const handleSendPush = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/notice/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: "Test Notification",
                    body: "This is a test notification " + new Date().toISOString()
                }),
            });

            if (response.ok) {
                console.log('Push notification sent successfully');
                toast.success('Push notification sent successfully');
            } else {
                console.error('Failed to send push notification');
                toast.error('Failed to send push notification');
            }
        } catch (error) {
            console.error('Error sending push notification:', error);
            toast.error('Error sending push notification');
        }
    };

    const showNotification = useCallback((title, body) => {
        console.log('Showing notification:', title, body);
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/firebase-logo.png'
            });
        }
        console.log(1)
        setNotification({ title, body });
    }, []);

    // 메시지 수신 리스너 설정 (useEffect 외부에서 호출)
    onMessageListener()
        .then((payload) => {
            console.log('Message received. ', payload);
            showNotification(payload.notification.title, payload.notification.body);
        })
        .catch((err) => console.log('Failed to receive message: ', err));

    return (
        <div className="App">
            <ToastContainer/>
            <h1>React Notification App</h1>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="orders"
                    value={orders}
                    onChange={(e) => setOrders(e.target.value)}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            <h2>Send Push Notification</h2>
            <button onClick={handleSendPush}>Send Push</button>
            <h2>Current Notification:</h2>
            <h3>{notification.title}</h3>
            <p>{notification.body}</p>
        </div>
    );
}

export default App;