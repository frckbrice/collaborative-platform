import Image from 'next/image';
import Footer from '@/components/features/landing-page/components/footer';

const TEAM = [
  { name: 'Avom Brice', role: 'CEO', avatar: '/avatars/7.png' },
  { name: 'Larry Lenon', role: 'CTO', avatar: '/avatars/2.png' },
  { name: 'Marceline', role: 'Product Lead', avatar: '/avatars/3.png' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-4 bg-background">
      {/* Hero */}
      <section className="max-w-2xl text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 ">About av-digital-workspaces</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Empowering teams to collaborate in real-time, boost productivity, and stay
          connected—wherever you are.
        </p>
        <span className="inline-block px-4 py-2 rounded-full  text-white font-semibold">
          Our Mission: Seamless Collaboration
        </span>
      </section>

      {/* Our Story */}
      <section className="max-w-3xl mb-16 text-center">
        <h2 className="text-3xl font-bold mb-2">Our Story</h2>
        <p className="text-muted-foreground text-lg">
          Founded in 2025, av-digital-workspaces was born from the need for a truly real-time,
          beautiful, and accessible collaboration platform. We believe in empowering teams of all
          sizes to work together effortlessly, no matter where they are in the world.
        </p>
      </section>

      {/* Team */}
      <section className="max-w-4xl w-full mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
        <div className="flex flex-wrap justify-center gap-10">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center bg-white/10 rounded-xl p-6 shadow-lg w-60"
            >
              <Image
                src={member.avatar}
                alt={member.name}
                width={80}
                height={80}
                className="rounded-full w-32 h-32 mb-4 border-4 border-[#a78bfa]/40"
              />
              <div className="font-semibold text-lg text-foreground">{member.name}</div>
              <div className="text-muted-foreground text-sm">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Want to join our journey?</h3>
        <a
          href="/contact"
          className="inline-block mt-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#38f9d7] to-[#a78bfa] text-white font-bold shadow-lg hover:from-[#a78bfa] hover:to-[#38f9d7] transition"
        >
          Contact Us
        </a>
      </section>
      <Footer />
    </main>
  );
}
