import Footer from "@/components/features/landing-page/components/footer";

export default function TermsOfServicePage() {
    return (
        <main className="min-h-screen flex flex-col items-center py-20 px-4 bg-background">
            <section className="max-w-3xl w-full bg-white/10 rounded-xl p-8 pb-0 shadow-lg">
                <h1 className="text-4xl font-bold mb-6 text-center dark:bg-gradient-to-r dark:from-[#38f9d7] dark:to-[#a78bfa] dark:bg-clip-text dark:text-transparent">Terms of Service</h1>
                <p className="mb-6 text-muted-foreground text-center">Last updated: June 2025</p>
                <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
                <p className="mb-4 text-muted-foreground">By using av-digital-workspaces, you agree to these Terms of Service. Please read them carefully before using our platform.</p>
                <h2 className="text-2xl font-semibold mb-2">2. Use of Service</h2>
                <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                    <li>You must be at least 13 years old to use av-digital-workspaces.</li>
                    <li>Do not misuse our services or attempt to disrupt them.</li>
                    <li>You are responsible for your account and activity.</li>
                </ul>
                <h2 className="text-2xl font-semibold mb-2">3. Intellectual Property</h2>
                <p className="mb-4 text-muted-foreground">All content, trademarks, and data on av-digital-workspaces are the property of av-digital-workspaces Inc. or its licensors. You may not use our branding without permission.</p>
                <h2 className="text-2xl font-semibold mb-2">4. Termination</h2>
                <p className="mb-4 text-muted-foreground">We may suspend or terminate your access to av-digital-workspaces at any time for violation of these terms or for any other reason.</p>
                <h2 className="text-2xl font-semibold mb-2">5. Limitation of Liability</h2>
                <p className="mb-4 text-muted-foreground">av-digital-workspaces is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from your use of the platform.</p>
                <h2 className="text-2xl font-semibold mb-2">6. Changes to Terms</h2>
                <p className="mb-4 text-muted-foreground">We may update these Terms of Service from time to time. Continued use of av-digital-workspaces means you accept the revised terms.</p>
                <h2 className="text-2xl font-semibold mb-2">7. Contact</h2>
                <p className="mb-2 text-muted-foreground">If you have questions about these terms, contact us at  <a href="mailto:bricefrkc@gmail.com" className="underline hover:text-primary">support@av-digital-workspaces.com</a>.</p>
            </section>
            <Footer />
        </main>
    );
} 