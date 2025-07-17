'use client';

import { useState, useTransition } from 'react';
import Footer from '@/components/features/landing-page/components/footer';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const COMPANY = {
  address: '123 Scalom Ave, Suite 456, Yaoundé, Cameroon',
  email: 'contact@av-digital-workspaces.com',
  phone: '+237 6 74 85 23 04',
  socials: [
    { name: 'Twitter', url: 'https://twitter.com/', icon: <FaTwitter /> },
    { name: 'LinkedIn', url: 'https://linkedin.com/', icon: <FaLinkedin /> },
    { name: 'Instagram', url: 'https://instagram.com/', icon: <FaInstagram /> },
  ],
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send message.');
        setSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Failed to send message.');
      }
    });
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-20 pb-0 px-4 bg-background">
      {/* Hero */}
      <section className="max-w-2xl text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 ">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-4">We&apos;d love to hear from you! Fill out the form or reach us directly.</p>
      </section>

      {/* Contact Form */}
      <section className="w-full max-w-xl bg-white/10 rounded-xl p-8 shadow-lg mb-12">
        {submitted ? (
          <div className="text-center text-green-500 font-semibold text-lg">T
            hank you for reaching out! We&apos;ll get back to you soon.</div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="px-4 py-3 rounded-lg bg-background border border-[#a78bfa]/30 text-foreground focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
              value={form.name}
              onChange={handleChange}
              required
              disabled={isPending}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="px-4 py-3 rounded-lg bg-background border border-[#a78bfa]/30 text-foreground focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isPending}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              className="px-4 py-3 rounded-lg bg-background border border-[#a78bfa]/30 text-foreground focus:outline-none focus:ring-2 focus:ring-[#a78bfa] min-h-[120px]"
              value={form.message}
              onChange={handleChange}
              required
              disabled={isPending}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="mt-2 px-6 py-3 bg-slate-800 text-slate-100 rounded-lg dark:bg-gradient-to-r dark:from-[#38f9d7] dark:to-[#a78bfa] dark:text-white font-bold shadow-lg hover:from-[#a78bfa] hover:to-[#38f9d7] transition disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </section>

      {/* Company Info & Socials */}
      {/* <section className="max-w-2xl text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Our Info</h2>
        <div className="text-muted-foreground mb-2">{COMPANY.address}</div>
        <div className="text-muted-foreground mb-2">
          <a href={`mailto:${COMPANY.email}`} className="hover:text-primary underline">{COMPANY.email}</a>
        </div>
        <div className="text-muted-foreground mb-4">
          <a href={`tel:${COMPANY.phone.replace(/\s+/g, '')}`} className="hover:text-primary underline">{COMPANY.phone}</a>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {COMPANY.socials.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition" aria-label={s.name} title={s.name}>
              <span>{s.icon}</span>
            </a>
          ))}
        </div>
      </section> */}
      <Footer />
    </main>
  );
} 