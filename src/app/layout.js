// src/app/layout.js
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased bg-black text-white">
        {children} 
      </body>
    </html>
  );
}