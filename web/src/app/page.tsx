'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

/* ───────────────── Data ───────────────── */
const STATS = [
  { value: '500+', label: 'Armada Aktif' },
  { value: '12K+', label: 'Pengiriman/Bulan' },
  { value: '34', label: 'Kota Terjangkau' },
  { value: '99.2%', label: 'On-Time Delivery' },
];

const SERVICES = [
  {
    icon: '🚛',
    title: 'Full Truckload (FTL)',
    desc: 'Pengiriman satu muatan penuh dengan armada truk modern untuk efisiensi maksimal dan keamanan kargo terjamin.',
  },
  {
    icon: '📦',
    title: 'Less Than Truckload',
    desc: 'Solusi hemat biaya untuk pengiriman parsial dengan konsolidasi cerdas dan jadwal reguler antar kota.',
  },
  {
    icon: '🏭',
    title: 'Warehouse & Distribution',
    desc: 'Gudang modern dengan sistem WMS terintegrasi, cross-docking, dan distribusi last-mile ke seluruh Jawa.',
  },
  {
    icon: '📍',
    title: 'Real-Time Tracking',
    desc: 'Pantau posisi armada secara real-time dengan GPS tracking, notifikasi otomatis, dan estimasi waktu tiba.',
  },
  {
    icon: '🧊',
    title: 'Cold Chain Logistics',
    desc: 'Transportasi berpendingin untuk produk farmasi, makanan, dan bahan kimia dengan kontrol suhu 24/7.',
  },
  {
    icon: '📊',
    title: 'Supply Chain Analytics',
    desc: 'Dashboard intelijen bisnis untuk optimasi rute, analisis biaya, dan perencanaan kapasitas armada.',
  },
];

const FLEET = [
  { name: 'Tronton Wing Box', count: '120 Unit', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop' },
  { name: 'Trailer Container', count: '85 Unit', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop' },
  { name: 'CDD / CDE Box', count: '200 Unit', img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=400&fit=crop' },
  { name: 'Reefer Truck', count: '95 Unit', img: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=600&h=400&fit=crop' },
];

const TESTIMONIALS = [
  { name: 'Ahmad Fauzi', role: 'Supply Chain Manager, PT. Maju Bersama', text: 'Desi Logistik mengubah cara kami mengelola distribusi. On-time rate naik 35% sejak kerja sama dimulai.' },
  { name: 'Siti Rahayu', role: 'Procurement Head, CV. Nusantara Foods', text: 'Cold chain mereka luar biasa. Produk dairy kami sampai dalam kondisi sempurna ke 20 kota sekaligus.' },
  { name: 'Budi Santoso', role: 'CEO, TechParts Indonesia', text: 'Real-time tracking dan dashboard analytics-nya sangat membantu kami memantau semua shipment dari satu layar.' },
];

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[family-name:var(--font-outfit)] selection:bg-red-500 selection:text-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-red-500/20">
              DL
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">DESI</span>
              <span className="text-xl font-light text-red-400 ml-1">LOGISTIK</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-zinc-400 hover:text-white transition-colors text-sm">Layanan</a>
            <a href="#fleet" className="text-zinc-400 hover:text-white transition-colors text-sm">Armada</a>
            <a href="#about" className="text-zinc-400 hover:text-white transition-colors text-sm">Tentang</a>
            <a href="#contact" className="text-zinc-400 hover:text-white transition-colors text-sm">Kontak</a>
            <Link href="/login" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20">
              Portal Login
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl" aria-label="Menu">
            {mobileMenu ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenu && (
          <div className="md:hidden bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 px-6 py-6 space-y-4">
            <a href="#services" onClick={() => setMobileMenu(false)} className="block text-zinc-300 hover:text-white">Layanan</a>
            <a href="#fleet" onClick={() => setMobileMenu(false)} className="block text-zinc-300 hover:text-white">Armada</a>
            <a href="#about" onClick={() => setMobileMenu(false)} className="block text-zinc-300 hover:text-white">Tentang</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="block text-zinc-300 hover:text-white">Kontak</a>
            <Link href="/login" className="block w-full text-center px-5 py-3 bg-red-600 rounded-lg font-semibold">Portal Login</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Image + Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=1080&fit=crop"
            alt="Logistics fleet"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Melayani Pengiriman Seluruh Indonesia
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-400">
              Solusi Logistik
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
              Terpercaya
            </span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Desi Logistik hadir sebagai mitra distribusi dan transportasi terkemuka di Indonesia.
            Dengan armada modern, teknologi real-time tracking, dan tim profesional siap melayani kebutuhan supply chain Anda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#contact" className="group relative px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-red-600/30 text-lg">
              Minta Penawaran
              <span className="ml-2">→</span>
            </a>
            <Link href="/dashboard" className="px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded-xl font-semibold transition-all backdrop-blur-sm">
              Lihat Dashboard
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-zinc-500 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-zinc-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative z-10 -mt-1">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-red-400">{s.value}</div>
                <div className="text-zinc-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-400 text-sm font-semibold uppercase tracking-widest">Layanan Kami</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Solusi Logistik <span className="text-red-400">End-to-End</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Dari pengiriman darat hingga manajemen gudang, kami menyediakan layanan logistik terintegrasi untuk mendukung pertumbuhan bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-red-500/30 hover:bg-zinc-900 transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-5">{s.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 px-6 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-red-400 text-sm font-semibold uppercase tracking-widest">Tentang Kami</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Lebih dari Sekadar <span className="text-red-400">Pengiriman</span>
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Didirikan pada tahun 2018, <span className="text-white font-semibold">Desi Logistik</span> telah berkembang menjadi salah satu penyedia jasa logistik terdepan di Indonesia. Kami menggabungkan keahlian operasional dengan teknologi mutakhir untuk menghadirkan pengalaman pengiriman yang tak tertandingi.
            </p>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Dengan kantor pusat di Surabaya dan jaringan distribusi yang menjangkau 34 kota besar, kami berkomitmen untuk menjadi tulang punggung supply chain bisnis Indonesia.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5">
                <div className="text-2xl font-bold text-red-400">2018</div>
                <div className="text-zinc-500 text-sm">Tahun Berdiri</div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5">
                <div className="text-2xl font-bold text-red-400">1,200+</div>
                <div className="text-zinc-500 text-sm">Karyawan</div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5">
                <div className="text-2xl font-bold text-red-400">ISO 9001</div>
                <div className="text-zinc-500 text-sm">Certified</div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5">
                <div className="text-2xl font-bold text-red-400">24/7</div>
                <div className="text-zinc-500 text-sm">Customer Support</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop"
                alt="Warehouse operations"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl">
              <div className="text-3xl font-bold text-red-400">A+</div>
              <div className="text-zinc-500 text-sm">Safety Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FLEET ─── */}
      <section id="fleet" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-400 text-sm font-semibold uppercase tracking-widest">Armada</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Armada <span className="text-red-400">Modern</span> Kami
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Didukung oleh 500+ unit kendaraan yang terawat dengan standar internasional dan dilengkapi GPS tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLEET.map((f) => (
              <div key={f.name} className="group relative rounded-2xl overflow-hidden border border-zinc-800 hover:border-red-500/30 transition-all duration-300">
                <div className="aspect-[3/2] relative">
                  <Image src={f.img} alt={f.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-bold text-lg">{f.name}</h3>
                  <p className="text-red-400 text-sm font-semibold">{f.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-6 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-red-400 text-sm font-semibold uppercase tracking-widest">Testimoni</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4">
              Kata <span className="text-red-400">Mereka</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 hover:border-red-500/20 transition-all">
                <div className="text-red-400 text-4xl mb-4">&quot;</div>
                <p className="text-zinc-300 mb-6 leading-relaxed">{t.text}</p>
                <div className="border-t border-zinc-800 pt-4">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-zinc-500 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-red-600/20 via-zinc-900 to-zinc-900 border border-red-500/20 rounded-3xl p-12 sm:p-16 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 blur-[120px] rounded-full" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Siap Untuk <span className="text-red-400">Bermitra?</span>
              </h2>
              <p className="text-zinc-400 mb-10 max-w-2xl mx-auto text-lg">
                Hubungi tim kami untuk konsultasi gratis dan penawaran spesial untuk kebutuhan logistik bisnis Anda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:sales@desilogistik.co.id" className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-red-600/30 text-lg">
                  📧 sales@desilogistik.co.id
                </a>
                <a href="tel:+62315550123" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-semibold transition-all text-lg">
                  📞 (031) 555-0123
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-zinc-800 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center font-bold text-lg">
                  DL
                </div>
                <div>
                  <span className="text-xl font-bold">DESI</span>
                  <span className="text-xl font-light text-red-400 ml-1">LOGISTIK</span>
                </div>
              </div>
              <p className="text-zinc-500 mb-4 max-w-sm leading-relaxed">
                Mitra logistik terpercaya untuk pengiriman darat, manajemen gudang, dan distribusi terintegrasi di seluruh Indonesia.
              </p>
              <div className="text-zinc-600 text-sm">
                Jl. Rungkut Industri Raya No. 18-20<br />
                Surabaya, Jawa Timur 60293
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <div className="space-y-2 text-zinc-500 text-sm">
                <div>Full Truckload</div>
                <div>Less Than Truckload</div>
                <div>Warehousing</div>
                <div>Cold Chain</div>
                <div>Last Mile Delivery</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <div className="space-y-2 text-zinc-500 text-sm">
                <div>Tentang Kami</div>
                <div>Karir</div>
                <div>Blog</div>
                <div>Kontak</div>
                <Link href="/login" className="block text-red-400 hover:text-red-300 transition-colors">Portal Login →</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-zinc-600 text-sm">
              &copy; 2026 Desi Logistik. All rights reserved.
            </div>
            <div className="flex gap-6 text-zinc-600 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
