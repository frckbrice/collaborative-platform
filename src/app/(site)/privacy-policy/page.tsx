import Footer from '@/components/features/landing-page/components/footer';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-4 bg-background">
      <section className="max-w-3xl w-full bg-white/10 rounded-xl p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center dark:bg-gradient-to-r dark:from-[#38f9d7] dark:to-[#a78bfa] dark:bg-clip-text dark:text-transparent">
          Privacy Policy
        </h1>
        <p className="mb-6 text-muted-foreground text-center">Last updated: June 2025</p>
        <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
        <p className="mb-4 text-muted-foreground">
          We value your privacy and are committed to protecting your personal information. This
          Privacy Policy explains how we collect, use, and safeguard your data when you use
          av-digital-workspaces.
        </p>
        <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground">
          <li>Information you provide (e.g., name, email, messages)</li>
          <li>Usage data (e.g., pages visited, features used, device/browser info)</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground">
          <li>To provide, maintain, and improve our services</li>
          <li>To communicate with you and respond to inquiries</li>
          <li>To ensure security, prevent fraud, and comply with legal obligations</li>
          <li>To personalize your experience and analyze usage</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-2">4. Cookies & Tracking</h2>
        <p className="mb-4 text-muted-foreground">
          We use cookies and similar technologies to enhance your experience, analyze usage, and
          deliver relevant content. You can control cookies through your browser settings, but
          disabling them may affect site functionality.
        </p>
        <h2 className="text-2xl font-semibold mb-2">5. Data Retention</h2>
        <p className="mb-4 text-muted-foreground">
          We retain your personal data only as long as necessary for the purposes described in this
          policy, or as required by law. When no longer needed, your data is securely deleted or
          anonymized.
        </p>
        <h2 className="text-2xl font-semibold mb-2">6. Third-Party Services</h2>
        <p className="mb-4 text-muted-foreground">
          We may use third-party services (e.g., analytics, payment processors) that collect, use,
          and share information according to their own privacy policies. We encourage you to review
          those policies.
        </p>
        <h2 className="text-2xl font-semibold mb-2">7. Data Sharing</h2>
        <p className="mb-4 text-muted-foreground">
          We do not sell your personal information. We may share data with trusted third parties for
          service provision, legal compliance, or protection of rights.
        </p>
        <h2 className="text-2xl font-semibold mb-2">8. Children&apos;s Privacy</h2>
        <p className="mb-4 text-muted-foreground">
          av-digital-workspaces is not intended for children under 13. We do not knowingly collect
          personal information from children. If you believe a child has provided us with data,
          please contact us for removal.
        </p>
        <h2 className="text-2xl font-semibold mb-2">9. Your Rights</h2>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground">
          <li>Access, update, or delete your data</li>
          <li>Opt out of marketing communications</li>
          <li>Request data portability</li>
          <li>Withdraw consent at any time (where applicable)</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-2">10. Changes to This Policy</h2>
        <p className="mb-4 text-muted-foreground">
          We may update this Privacy Policy from time to time. We will notify you of significant
          changes by posting the new policy on this page and updating the date above.
        </p>
        <h2 className="text-2xl font-semibold mb-2">11. Contact Us</h2>
        <p className="mb-2 text-muted-foreground">
          If you have questions or concerns about this policy, contact us at{' '}
          <a href="mailto:bricefrkc@gmail.com" className="underline hover:text-primary">
            support@av-digital-workspaces.com
          </a>
          .
        </p>
      </section>
      <Footer />
    </main>
  );
}
