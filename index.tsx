import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);<form action="https://formsubmit.co/youremail@example.com" method="POST">
  <input type="text" name="name" placeholder="Izina" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Ubutumwa" required></textarea>
  <button type="submit">Ohereza</button>
</form>
