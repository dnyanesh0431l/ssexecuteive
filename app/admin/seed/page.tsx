// app/admin/seed/page.tsx
"use client";

import { collection, deleteDoc, getDocs } from "firebase/firestore";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "../../components/admin/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import type { BannerInput } from "../../lib/firebase/banners";
import { createBanner } from "../../lib/firebase/banners";
import type { BrandInput, ColorInput } from "../../lib/firebase/brands";
import { createBrand, createColor } from "../../lib/firebase/brands";
import type { CategoryInput } from "../../lib/firebase/categories";
import { createCategory } from "../../lib/firebase/categories";
import { db } from "../../lib/firebase/config";
import type { GalleryInput } from "../../lib/firebase/gallery";
import { createGalleryImage } from "../../lib/firebase/gallery";

/* ------------------------------------------------------------------ */
/* Image helper — picsum is reliable and never 404s                     */
/* ------------------------------------------------------------------ */

const img = (seed: string, w = 800, h = 800) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

/* ------------------------------------------------------------------ */
/* Mock data                                                            */
/* ------------------------------------------------------------------ */

interface MockColor {
  name: string;
  code: string;
}

interface MockBrand {
  name: string;
  slug: string;
  description: string;
  sizes: string[];
  imageCount: number;
  colors: MockColor[];
}

interface MockCategory {
  name: string;
  slug: string;
  description: string;
  brands: MockBrand[];
}

const CATEGORIES: MockCategory[] = [
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description:
      "Premium cotton tees for everyday wear — multiple colours, fits and fabric weights.",
    brands: [
      {
        name: "US-POLO",
        slug: "us-polo",
        description:
          "Classic crew-neck tee in 180 GSM combed cotton. Pre-shrunk and colourfast.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        imageCount: 2,
        colors: [
          { name: "Z-Black", code: "#111111" },
          { name: "White", code: "#FFFFFF" },
          { name: "Navy", code: "#1B2A4A" },
          { name: "Brown", code: "#7B4A2D" },
        ],
      },
      {
        name: "RUFTY",
        slug: "rufty",
        description:
          "Relaxed-fit heavyweight tee. 220 GSM ring-spun cotton with vintage wash.",
        sizes: ["M", "L", "XL", "XXL"],
        imageCount: 2,
        colors: [
          { name: "Charcoal", code: "#3A3A3A" },
          { name: "Sand", code: "#D8C3A5" },
          { name: "Olive", code: "#5A6B3B" },
        ],
      },
      {
        name: "Classic Crew",
        slug: "classic-crew",
        description:
          "Timeless everyday tee with a clean silhouette and reinforced neckline.",
        sizes: ["S", "M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "White", code: "#FFFFFF" },
          { name: "Black", code: "#111111" },
          { name: "Heather Grey", code: "#9A9A9A" },
        ],
      },
      {
        name: "Essential Tee",
        slug: "essential-tee",
        description:
          "Soft-touch staple tee with a modern regular fit and side-seam construction.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        imageCount: 2,
        colors: [
          { name: "Navy", code: "#1B2A4A" },
          { name: "White", code: "#FFFFFF" },
          { name: "Maroon", code: "#6B1F2A" },
          { name: "Forest", code: "#2F4A34" },
        ],
      },
      {
        name: "Streetwear Co",
        slug: "streetwear-co",
        description: "Boxy-fit drop-shoulder tee for a bold streetwear look.",
        sizes: ["M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Black", code: "#111111" },
          { name: "Off White", code: "#F1EDE5" },
        ],
      },
    ],
  },
  {
    name: "Polo Shirts",
    slug: "polo-shirts",
    description:
      "Smart-casual polos with pique cotton and clean tailoring — perfect for uniforms.",
    brands: [
      {
        name: "Executive Polo",
        slug: "executive-polo",
        description:
          "Refined pique polo with tipped collar and mother-of-pearl buttons.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        imageCount: 2,
        colors: [
          { name: "Navy", code: "#1B2A4A" },
          { name: "White", code: "#FFFFFF" },
          { name: "Sky Blue", code: "#8FB4D9" },
          { name: "Black", code: "#111111" },
        ],
      },
      {
        name: "Signature Polo",
        slug: "signature-polo",
        description: "Combed cotton polo with a subtle sheen and tailored fit.",
        sizes: ["M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Burgundy", code: "#5A1A28" },
          { name: "White", code: "#FFFFFF" },
          { name: "Grey", code: "#7E7E7E" },
        ],
      },
      {
        name: "Court Polo",
        slug: "court-polo",
        description:
          "Sport-inspired polo with contrast placket and breathable mesh back.",
        sizes: ["S", "M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "White", code: "#FFFFFF" },
          { name: "Navy", code: "#1B2A4A" },
          { name: "Green", code: "#2F6B3B" },
        ],
      },
      {
        name: "Heritage Polo",
        slug: "heritage-polo",
        description:
          "Vintage-inspired polo in heavy pique with a lived-in softness.",
        sizes: ["M", "L", "XL", "XXL"],
        imageCount: 2,
        colors: [
          { name: "Beige", code: "#C9B48F" },
          { name: "Brown", code: "#5B3A24" },
          { name: "Navy", code: "#1B2A4A" },
        ],
      },
    ],
  },
  {
    name: "Aprons",
    slug: "aprons",
    description:
      "Durable, professional aprons for kitchens, salons and workshops.",
    brands: [
      {
        name: "Chef Pro",
        slug: "chef-pro",
        description:
          "Professional chef apron with stain-resistant finish and reinforced stitching.",
        sizes: ["M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Black", code: "#111111" },
          { name: "White", code: "#FFFFFF" },
          { name: "Grey", code: "#7E7E7E" },
        ],
      },
      {
        name: "Bistro Apron",
        slug: "bistro-apron",
        description:
          "Half-length bistro apron with twin front pockets and a wide waist tie.",
        sizes: ["M", "L"],
        imageCount: 2,
        colors: [
          { name: "Black", code: "#111111" },
          { name: "Navy", code: "#1B2A4A" },
        ],
      },
      {
        name: "Workshop Apron",
        slug: "workshop-apron",
        description:
          "Heavy-duty canvas apron with cross-back straps and tool loops.",
        sizes: ["M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Khaki", code: "#B8A47A" },
          { name: "Black", code: "#111111" },
          { name: "Brown", code: "#5B3A24" },
        ],
      },
      {
        name: "Canvas Apron",
        slug: "canvas-apron",
        description:
          "Everyday canvas apron with adjustable neck strap and double front pockets.",
        sizes: ["M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Natural", code: "#E8DDBE" },
          { name: "Olive", code: "#5A6B3B" },
        ],
      },
    ],
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    description:
      "Warm, heavyweight hoodies in brushed fleece — built for comfort and layering.",
    brands: [
      {
        name: "Fleece Hoodie",
        slug: "fleece-hoodie",
        description:
          "320 GSM brushed fleece hoodie with kangaroo pocket and double-lined hood.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        imageCount: 2,
        colors: [
          { name: "Black", code: "#111111" },
          { name: "Grey", code: "#7E7E7E" },
          { name: "Navy", code: "#1B2A4A" },
          { name: "Maroon", code: "#6B1F2A" },
        ],
      },
      {
        name: "Zip-Up Classic",
        slug: "zip-up-classic",
        description:
          "Full-zip hoodie with metal zipper, ribbed cuffs and split kangaroo pockets.",
        sizes: ["M", "L", "XL", "XXL"],
        imageCount: 2,
        colors: [
          { name: "Black", code: "#111111" },
          { name: "Navy", code: "#1B2A4A" },
          { name: "Grey", code: "#7E7E7E" },
        ],
      },
      {
        name: "Oversized Hoodie",
        slug: "oversized-hoodie",
        description:
          "Boxy oversized hoodie with dropped shoulders and premium heavyweight fleece.",
        sizes: ["M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Cream", code: "#F1EDE5" },
          { name: "Black", code: "#111111" },
          { name: "Olive", code: "#5A6B3B" },
          { name: "Brown", code: "#5B3A24" },
        ],
      },
      {
        name: "Tech Fleece",
        slug: "tech-fleece",
        description:
          "Technical fleece hoodie with moisture-wicking lining and bonded seams.",
        sizes: ["S", "M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Black", code: "#111111" },
          { name: "Charcoal", code: "#3A3A3A" },
          { name: "Navy", code: "#1B2A4A" },
        ],
      },
      {
        name: "Vintage Hoodie",
        slug: "vintage-hoodie",
        description:
          "Garment-dyed hoodie with a faded, lived-in look and soft hand-feel.",
        sizes: ["M", "L", "XL"],
        imageCount: 2,
        colors: [
          { name: "Washed Grey", code: "#A5A5A5" },
          { name: "Faded Black", code: "#2A2A2A" },
          { name: "Sand", code: "#D8C3A5" },
        ],
      },
    ],
  },
];

const BANNERS: BannerInput[] = [
  {
    image: img("banner-hero-1", 1920, 720),
    title: "SS Executive Offer's",
    subtitle:
      "Premium T-Shirts, Polos, Aprons & Hoodies — bulk orders welcome.",
    link: "/brands",
    active: true,
  },
  {
    image: img("banner-hero-2", 1920, 720),
    title: "New Season Arrivals",
    subtitle: "Fresh colours and fits added every month.",
    link: "/brands",
    active: true,
  },
];

const GALLERY: GalleryInput[] = [
  {
    image: img("gallery-studio", 1200, 1200),
    title: "Studio Shoot",
    description: "Behind the scenes of our latest collection.",
  },
  {
    image: img("gallery-fabric", 1200, 1200),
    title: "Fabric Close-up",
    description: "Combed cotton texture at 180 GSM.",
  },
  {
    image: img("gallery-workshop", 1200, 1200),
    title: "Workshop",
    description: "Where every piece is finished by hand.",
  },
  {
    image: img("gallery-flatlay", 1200, 1200),
    title: "Flat Lay",
    description: "A curated look at the season's palette.",
  },
];

/* ------------------------------------------------------------------ */
/* Clear + seed logic                                                  */
/* ------------------------------------------------------------------ */

async function clearAllData() {
  // 1. Colours (subcollection of brands)
  const brandsSnap = await getDocs(collection(db, "brands"));
  for (const brand of brandsSnap.docs) {
    const colorsSnap = await getDocs(
      collection(db, "brands", brand.id, "colors"),
    );
    await Promise.all(colorsSnap.docs.map((c) => deleteDoc(c.ref)));
  }

  // 2. Brands
  await Promise.all(brandsSnap.docs.map((b) => deleteDoc(b.ref)));

  // 3. Categories
  const catsSnap = await getDocs(collection(db, "categories"));
  await Promise.all(catsSnap.docs.map((c) => deleteDoc(c.ref)));

  // 4. Banners
  const bannersSnap = await getDocs(collection(db, "banners"));
  await Promise.all(bannersSnap.docs.map((b) => deleteDoc(b.ref)));

  // 5. Gallery
  const gallerySnap = await getDocs(collection(db, "gallery"));
  await Promise.all(gallerySnap.docs.map((g) => deleteDoc(g.ref)));
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Step = {
  label: string;
  status: "pending" | "running" | "done";
};

const INITIAL_STEPS: Step[] = [
  { label: "Clearing existing data", status: "pending" },
  { label: "Creating categories", status: "pending" },
  { label: "Creating brands & colours", status: "pending" },
  { label: "Creating banners", status: "pending" },
  { label: "Creating gallery images", status: "pending" },
];

export default function SeedPage() {
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  const setStepStatus = (index: number, status: Step["status"]) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s)),
    );
  };

  const reset = () => {
    setSteps(INITIAL_STEPS);
    setDone(false);
  };

  const run = async () => {
    setRunning(true);
    reset();

    try {
      // Step 1 — Clear
      setStepStatus(0, "running");
      await clearAllData();
      setStepStatus(0, "done");
      toast.success("Cleared", "All previous data removed.");

      // Step 2 — Categories
      setStepStatus(1, "running");
      const categoryIds: string[] = [];
      for (const cat of CATEGORIES) {
        const input: CategoryInput = {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: img(`cat-${cat.slug}`, 1200, 600),
        };
        const id = await createCategory(input);
        categoryIds.push(id);
      }
      setStepStatus(1, "done");
      toast.success(
        "Categories created",
        `${CATEGORIES.length} categories added.`,
      );

      // Step 3 — Brands + Colours
      setStepStatus(2, "running");
      let brandCount = 0;
      let colorCount = 0;

      for (let ci = 0; ci < CATEGORIES.length; ci++) {
        const category = CATEGORIES[ci];
        const categoryId = categoryIds[ci];

        for (const brand of category.brands) {
          const images = Array.from({ length: brand.imageCount }, (_, i) =>
            img(`brand-${brand.slug}-${i + 1}`, 800, 800),
          );

          const brandInput: BrandInput = {
            name: brand.name,
            slug: brand.slug,
            description: brand.description,
            categoryId,
            images,
            sizes: brand.sizes,
          };

          const brandId = await createBrand(brandInput);
          brandCount++;

          for (const color of brand.colors) {
            const colorInput: ColorInput = {
              name: color.name,
              code: color.code,
              image: img(
                `color-${brand.slug}-${color.code.replace("#", "")}`,
                800,
                800,
              ),
            };
            await createColor(brandId, colorInput);
            colorCount++;
          }
        }
      }

      setStepStatus(2, "done");
      toast.success(
        "Brands & colours created",
        `${brandCount} brands · ${colorCount} colours.`,
      );

      // Step 4 — Banners
      setStepStatus(3, "running");
      for (const banner of BANNERS) {
        await createBanner(banner);
      }
      setStepStatus(3, "done");
      toast.success("Banners created", `${BANNERS.length} added.`);

      // Step 5 — Gallery
      setStepStatus(4, "running");
      for (const item of GALLERY) {
        await createGalleryImage(item);
      }
      setStepStatus(4, "done");
      toast.success("Gallery created", `${GALLERY.length} images added.`);

      setDone(true);
    } catch (error) {
      console.error(error);
      toast.error(
        "Seeding failed",
        "Check the console for details. Some data may have been created.",
      );
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "running" ? { ...s, status: "pending" } : s,
        ),
      );
    } finally {
      setRunning(false);
    }
  };

  const totalBrands = CATEGORIES.reduce((sum, c) => sum + c.brands.length, 0);
  const totalColors = CATEGORIES.reduce(
    (sum, c) => sum + c.brands.reduce((s, b) => s + b.colors.length, 0),
    0,
  );

  return (
    <>
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <PageHeader
        title="Seed mock data"
        description="Wipes existing catalogue data and inserts a fresh, fully-populated set."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader
            title="What will be created"
            description="Images are pulled from picsum.photos so they always load."
          />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Categories" value={CATEGORIES.length} />
              <Stat label="Brands" value={totalBrands} />
              <Stat label="Colours" value={totalColors} />
              <Stat label="Banners" value={BANNERS.length} />
            </div>

            <ul className="space-y-2 text-[13px] leading-6 text-black/70">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#B80A0B]" />
                  <span>
                    <strong>{cat.name}</strong> — {cat.brands.length} brands ·{" "}
                    {cat.brands.reduce((s, b) => s + b.colors.length, 0)}{" "}
                    colours
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#1845D6]" />
                <span>
                  <strong>Gallery</strong> — {GALLERY.length} images
                </span>
              </li>
            </ul>

            <div className="flex items-start gap-3 rounded-md border border-[#B80A0B]/20 bg-[rgba(184,10,11,0.04)] px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B80A0B]" />
              <p className="text-[13px] leading-6 text-[#B80A0B]">
                <strong>This wipes everything.</strong> All existing categories,
                brands, colours, banners and gallery images will be permanently
                deleted before the new data is inserted.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                onClick={() => void run()}
                loading={running}
                icon={<Sparkles className="h-4 w-4" />}
                disabled={running}
              >
                {done ? "Re-seed again" : "Clear & seed fresh data"}
              </Button>
              {done ? (
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#1845D6]">
                  <CheckCircle2 className="h-4 w-4" />
                  Seed complete
                </span>
              ) : null}
            </div>

            {done ? (
              <div className="rounded-md border border-[#1845D6]/20 bg-[rgba(24,69,214,0.05)] px-4 py-3 text-[13px] leading-6 text-[#1845D6]">
                Head to{" "}
                <Link href="/admin/categories" className="underline">
                  Categories
                </Link>
                ,{" "}
                <Link href="/admin/brands" className="underline">
                  Brands
                </Link>
                ,{" "}
                <Link href="/admin/banners" className="underline">
                  Banners
                </Link>{" "}
                or{" "}
                <Link href="/admin/gallery" className="underline">
                  Gallery
                </Link>{" "}
                to see the new data.
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Progress" />
          <CardBody>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={step.label} className="flex items-center gap-3">
                  <span
                    className={
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium " +
                      (step.status === "done"
                        ? "border-[#1845D6] bg-[rgba(24,69,214,0.06)] text-[#1845D6]"
                        : step.status === "running"
                          ? "border-[#B80A0B] bg-[rgba(184,10,11,0.06)] text-[#B80A0B]"
                          : "border-[#E5E5E5] bg-white text-black/40")
                    }
                  >
                    {step.status === "done" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : step.status === "running" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={
                      "text-[13px] " +
                      (step.status === "pending"
                        ? "text-black/45"
                        : "font-medium text-black")
                    }
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-black">
        {value}
      </p>
    </div>
  );
}
