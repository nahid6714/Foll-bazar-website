import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#df2d4d', marginBottom: '12px' }}>৪০৪</h1>
      <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>পেজটি পাওয়া যায়নি</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>আপনি যে পেজটি খুঁজছেন তা সরানো হয়েছে অথবা লিংকটি সঠিক নয়।</p>
      <Link
        href="/"
        style={{
          backgroundColor: '#df2d4d',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}
