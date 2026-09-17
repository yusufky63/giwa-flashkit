import React from 'react'

export const metadata = {
  title: 'FlashKit Basic Next.js Example',
  description: 'Minimal integration example of FlashKit for GIWA Sepolia'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#09090b', color: '#fafafa', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
