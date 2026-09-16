"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#F4F0E8] text-[#111111] selection:bg-[#7B1728] selection:text-white">

      {/* ================= NAVBAR ================= */}
      

      {/* ================= HERO ================= */}
     <section className="relative min-h-screen overflow-hidden bg-white">

  {/* Blue visual block */}
  <div className="absolute right-0 top-0 h-full w-[38%] bg-[#1845D6]" />

  <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] items-center px-6 lg:grid-cols-2 lg:px-12">

    <div>
      <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-[#B80A0B]">
        Premium Tailoring
      </p>

      <h1 className="font-serif text-7xl font-bold leading-[0.9] tracking-tight lg:text-[110px]">
        Dress
        <br />
        <span className="text-[#B80A0B]">Beyond</span>
        <br />
        Ordinary.
      </h1>

      <p className="mt-8 max-w-lg text-base leading-7 text-black/60">
        Precision tailoring crafted around your individuality.
        Exceptional fit, timeless style and uncompromising attention
        to every detail.
      </p>

      <div className="mt-10 flex gap-4">
        <button className="bg-[#B80A0B] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black">
          Explore Collection
        </button>

        <button className="border-2 border-[#1845D6] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#1845D6] transition hover:bg-[#1845D6] hover:text-white">
          Book Appointment
        </button>
      </div>
    </div>

    {/* Image */}
    <div className="relative z-10 mx-auto w-full max-w-[520px]">
      <div className="relative aspect-[3/4] overflow-hidden border-[12px] border-white shadow-2xl">
        <Image
          src="https://i.pinimg.com/1200x/bc/b0/27/bcb02743c7a9fa1766ef6201bf7a7aab.jpg"
          alt="Executive tailoring"
          fill
          className="object-cover"
        />
      </div>

      {/* Red accent */}
      <div className="absolute -bottom-8 -left-8 bg-[#B80A0B] px-8 py-6 text-white">
        <p className="text-[9px] uppercase tracking-[0.3em]">
          Made to Measure
        </p>
        <p className="mt-1 font-serif text-2xl">
          Executive
        </p>
      </div>
    </div>

  </div>
</section>

   

    </main>
  );
}


/* ================= COMPONENTS ================= */

function CollectionCard({
  image,
  number,
  title,
  subtitle,
}: {
  image: string;
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#222]">

        <Image
          src={image}
          alt={title}
          fill
          className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute left-6 top-6">
          <span className="font-serif text-3xl text-[#B89B62]">
            {number}
          </span>
        </div>

        <div className="absolute bottom-7 left-7">
          <h3 className="font-serif text-4xl">{title}</h3>
          <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-white/50">
            {subtitle}
          </p>
        </div>

        <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </div>

      </div>
    </motion.div>
  );
}


function CraftItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-6 border-b border-black/10 pb-6">
      <span className="font-serif text-xl text-[#B89B62]">
        {number}
      </span>

      <div>
        <h3 className="font-serif text-xl">{title}</h3>
        <p className="mt-2 max-w-md text-xs leading-6 text-black/50">
          {text}
        </p>
      </div>
    </div>
  );
}