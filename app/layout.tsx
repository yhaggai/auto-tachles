import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'אוטו תכל׳ס | רכבי אוטותל בהנחה',description:'Find discounted AutoTel cars around Tel Aviv. Live availability, clear discounts, and directions.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="he" dir="rtl"><head><link rel="stylesheet" href="/vendor/leaflet.css"/></head><body>{children}</body></html>}
