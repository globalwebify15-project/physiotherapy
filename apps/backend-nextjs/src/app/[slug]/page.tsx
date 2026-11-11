import React from 'react';
import { connectDB, CMS } from 'database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const SLUG_TO_KEY_MAP: Record<string, string> = {
  'privacy': 'policy_privacy',
  'privacy-policy': 'policy_privacy',
  'terms': 'policy_terms',
  'terms-and-conditions': 'policy_terms',
  'refund-policy': 'policy_refund',
  'cancellation-refund-policy': 'policy_refund',
  'contact-us': 'policy_contact_us',
  'contact': 'policy_contact_us',
  'shipping-delivery-policy': 'policy_shipping_delivery',
  'fulfillment-policy': 'policy_shipping_delivery',
  'about-us': 'policy_about_us',
  'about': 'policy_about_us',
  'medical-disclaimer': 'policy_medical_disclaimer',
  'delete-account': 'policy_delete_account',
};

const NAV_LINKS = [
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms & Conditions' },
  { slug: 'refund-policy', label: 'Refund Policy' },
  { slug: 'contact-us', label: 'Contact Us' },
  { slug: 'about-us', label: 'About Us' },
  { slug: 'shipping-delivery-policy', label: 'Service Delivery' },
  { slug: 'medical-disclaimer', label: 'Medical Disclaimer' },
  { slug: 'delete-account', label: 'Delete Account' },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = SLUG_TO_KEY_MAP[slug.toLowerCase()];
  if (!key) return { title: 'Not Found | QuickPhysio24.com' };

  await connectDB();
  const cmsDoc: any = await CMS.findOne({ key }).lean();
  const title = cmsDoc?.content?.title || 'Legal Policy';

  return {
    title: `${title} | QuickPhysio24.com`,
    description: cmsDoc?.content?.summary || 'Official policies of QuickPhysio24.com',
  };
}

export default async function BackendCompliancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonicalSlug = slug.toLowerCase();
  const key = SLUG_TO_KEY_MAP[canonicalSlug];

  if (!key) {
    notFound();
  }

  await connectDB();
  const cmsDoc: any = await CMS.findOne({ key }).lean();

  if (!cmsDoc || !cmsDoc.content) {
    notFound();
  }

  const data = cmsDoc.content;
  const isRefund = canonicalSlug === 'refund-policy' || canonicalSlug === 'cancellation-refund-policy';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Info Bar */}
      <div style={{ background: '#0f766e', color: '#ccfbf1', padding: '8px 16px', fontSize: 12 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
          <span>Official Entity: <strong style={{ color: '#fff' }}>QuickPhysio24.com</strong> • Synergy Global Hospital, Ranchi</span>
          <span>Helpline: +91 91109 12544 | Email: contact@quickphysio24.com</span>
        </div>
      </div>

      {/* Header & Nav */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 16px 12px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 800, fontSize: 20 }}>
              QuickPhysio<span style={{ color: '#0f766e' }}>24.com</span>
            </Link>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4' }}>
              Synergy Global Hospital Dept
            </span>
          </div>

          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {NAV_LINKS.map((item) => {
              const active = canonicalSlug === item.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  style={{
                    textDecoration: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: active ? '#0f766e' : '#f1f5f9',
                    color: active ? '#ffffff' : '#475569',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1000, margin: '32px auto', padding: '0 16px' }}>
        <article style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4' }}>
              {data.badge || 'Official Legal Policy'}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Last Updated: <strong>{data.lastUpdated || 'November 2026'}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 900, margin: '8px 0 12px', color: '#0f172a' }}>
            {data.title}
          </h1>

          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 20 }}>
            {data.summary}
          </p>

          {isRefund && (
            <div style={{ background: '#f0fdfa', border: '2px solid #5eead4', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#134e4a' }}>
                {data.cancellationWindowDays || 7}-Day Full Refund Policy Guaranteed
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#115e59', lineHeight: 1.5 }}>
                Advance bookings and packages may be cancelled up to <strong>{data.cancellationWindowDays || 7} days</strong> prior to the scheduled date for a <strong>100% full refund</strong> directly to the original payment source within 5-7 business days.
              </p>
            </div>
          )}

          {/* Sections */}
          {data.sections && Array.isArray(data.sections) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {data.sections.map((section: any, idx: number) => (
                <section key={idx}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    {section.heading}
                  </h2>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, margin: 0 }}>
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          )}

          {/* Business Entity & Grievance Info */}
          <div style={{ marginTop: 32, padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>
              Registered Entity & Grievance Officer
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
              <div><strong>Business Name:</strong> {data.businessName || 'QuickPhysio24.com'}</div>
              <div><strong>Grievance Officer:</strong> {data.grievanceOfficer || 'Dr. Rajnish Bariyar'}</div>
              <div><strong>Support Email:</strong> {data.supportEmail || 'contact@quickphysio24.com'}</div>
              <div><strong>Support Phone:</strong> {data.supportPhone || '+91 91109 12544'}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Clinic Address:</strong> {data.clinicAddress || 'Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009'}
              </div>
            </div>
          </div>
        </article>
      </main>

      <footer style={{ textAlign: 'center', padding: '24px 16px', fontSize: 12, color: '#64748b' }}>
        © 2026 QuickPhysio24.com • Physiotherapy Department, Synergy Global Hospital, Bariatu, Ranchi - 834009
      </footer>
    </div>
  );
}

