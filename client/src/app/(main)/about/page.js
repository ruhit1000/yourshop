import Image from "next/image";
import { Compass, ShieldCheck, HeartHandshake, Eye } from "lucide-react";

export const metadata = {
  title: "About Us | YourShop",
  description: "Learn more about our mission, journey, values, and the expert team behind YourShop.",
};

const VALUES = [
  {
    icon: Compass,
    title: "Innovation",
    description: "Continuously pushing boundaries to design and deliver cutting-edge technology that simplifies lives.",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Quality",
    description: "Every product in our catalog undergoes strict quality control to guarantee peak reliability.",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "No hidden policies, no markup fees. Clear specifications and direct pricing you can trust.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: HeartHandshake,
    title: "Support",
    description: "A customer-first culture ensuring 24/7 technical assistance and painless returns.",
    color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
  },
];

const TIMELINE = [
  { year: "2024", title: "The Spark", desc: "YourShop is founded in a small garage with one simple mission: build the world's most accessible, reliable electronics marketplace." },
  { year: "2025", title: "API and Scale", desc: "Migrated to our robust modular backend. Handled over 100,000 orders while maintaining 99.9% uptime." },
  { year: "2026", title: "AI Revolution", desc: "Integrated conversational commerce, real-time tracking, and automated fulfillment logic to redefine the retail experience." },
];

const TEAM = [
  {
    name: "Marcus Vance",
    role: "Co-Founder & CEO",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    bio: "Former tech director focused on sustainable commerce and retail innovation.",
  },
  {
    name: "Sonia Patel",
    role: "Chief Technology Officer",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    bio: "Distributed systems expert with a passion for blazing-fast database design.",
  },
  {
    name: "Leo Sterling",
    role: "VP of Product Strategy",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    bio: "Obsessed with creating intuitive user interfaces and premium unboxing journeys.",
  },
  {
    name: "Elena Rostova",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    bio: "Fulfillment genius orchestrating worldwide supply chains with absolute precision.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white pt-28 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 max-w-6xl mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-sm font-semibold tracking-widest text-blue-500 uppercase">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Pioneering the Next Era of <span className="gradient-text">E-Commerce</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              We started YourShop to bridge the gap between premium electronics and accessible design. Our journey began with a simple question: why should high-fidelity gear be wrapped in high-friction purchasing? Today, we are creating a seamless shop built on speed, aesthetics, and reliability.
            </p>
            <div className="p-6 glass border border-white/10 rounded-2xl">
              <h3 className="font-bold text-white mb-2">Our Mission Statement</h3>
              <p className="text-sm text-gray-400 italic">
                "To build the most intuitive e-commerce ecosystem, delivering state-of-the-art tech while empowering creators and consumers alike with absolute transparency."
              </p>
            </div>
          </div>
          <div className="relative h-[350px] md:h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt="Our collaborative workplace"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-white/[0.02] border-y border-white/5 py-20 mb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16">The Journey</h2>
          <div className="flex flex-col md:flex-row gap-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {TIMELINE.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[280px] glass border border-white/10 p-8 rounded-2xl relative"
              >
                <div className="absolute -top-6 left-8 bg-blue-600 text-white font-black text-xl px-4 py-1.5 rounded-xl shadow-lg shadow-blue-500/20">
                  {item.year}
                </div>
                <h3 className="font-bold text-lg text-white mt-4 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="container mx-auto px-4 max-w-6xl mb-24">
        <h2 className="text-3xl font-bold text-center mb-16">Our Core Values</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="glass border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all text-center flex flex-col items-center"
              >
                <div className={`p-4 rounded-xl border mb-6 ${val.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-white mb-2">{val.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-16">Meet the Team</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((member, idx) => (
            <div
              key={idx}
              className="glass border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col"
            >
              <div className="relative h-64 w-full bg-slate-900">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">{member.name}</h3>
                  <div className="text-xs text-blue-400 font-semibold mb-3 mt-1 uppercase tracking-wide">
                    {member.role}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
