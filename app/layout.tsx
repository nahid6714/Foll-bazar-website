import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ফল বাজার',
  description: 'ফল বাজার বাংলাদেশের অন্যতম সেরা ই-কমার্স প্ল্যাটফর্ম। আমাদের এখানে পাবেন দিনাজপুরের বিখ্যাত লিচু ও সুস্বাদু ফলমূল।',
  icons: {
    icon: 'https://demo.scaleuper.com/public/uploads/settings/1783100605-404678363_761540535989009_175045591908436401_n.webp',
  },
  openGraph: {
    title: 'ফল বাজার',
    description: 'ফল বাজার বাংলাদেশের অন্যতম সেরা ই-কমার্স প্ল্যাটফর্ম। আমাদের এখানে পাবেন দিনাজপুরের বিখ্যাত লিচু ও সুস্বাদু ফলমূল।',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ফল বাজার',
    description: 'ফল বাজার বাংলাদেশের অন্যতম সেরা ই-কমার্স প্ল্যাটফর্ম। আমাদের এখানে পাবেন দিনাজপুরের বিখ্যাত লিচু ও সুস্বাদু ফলমূল।',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="bn">
      <body className="app-home" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
