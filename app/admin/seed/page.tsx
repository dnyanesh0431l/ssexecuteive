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
import type { BrandInput } from "../../lib/firebase/brands";
import { createBrand } from "../../lib/firebase/brands";
import type { CategoryInput } from "../../lib/firebase/categories";
import { createCategory } from "../../lib/firebase/categories";
import { db } from "../../lib/firebase/config";
import type { GalleryInput } from "../../lib/firebase/gallery";
import { createGalleryImage } from "../../lib/firebase/gallery";
import type { ColorInput, ProductInput } from "../../lib/firebase/products";
import { createProduct, createProductColor } from "../../lib/firebase/products";

const img = (seed: string, w = 800, h = 800) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

interface MockColor {
  name: string;
  code: string;
}
interface MockProduct {
  name: string;
  slug: string;
  description: string;
  sizes: string[];
  colors: MockColor[];
}
interface MockBrand {
  name: string;
  slug: string;
  description: string;
  bannerCount: number;
  products: MockProduct[];
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
        description: "Classic crew-neck tees in combed cotton.",
        bannerCount: 2,
        products: [
          {
            name: "US-RWI36",
            slug: "us-rwi36",
            description:
              "180 GSM combed cotton crew-neck tee. Pre-shrunk and colourfast.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Z-Black", code: "#111111" },
              { name: "White", code: "#FFFFFF" },
              { name: "Navy", code: "#1B2A4A" },
              { name: "Brown", code: "#7B4A2D" },
            ],
          },
          {
            name: "US-RWI42",
            slug: "us-rwi42",
            description: "Heavyweight 220 GSM tee with dropped shoulders.",
            sizes: ["M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Sand", code: "#D8C3A5" },
            ],
          },
        ],
      },
      {
        name: "RUFTY",
        slug: "rufty",
        description: "Relaxed-fit heavyweight tees.",
        bannerCount: 2,
        products: [
          {
            name: "Vintage Wash",
            slug: "vintage-wash",
            description: "Vintage washed heavyweight tee.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Charcoal", code: "#3A3A3A" },
              { name: "Olive", code: "#5A6B3B" },
            ],
          },
        ],
      },
      {
        name: "Classic Crew",
        slug: "classic-crew",
        description: "Everyday crew-neck staples.",
        bannerCount: 2,
        products: [
          {
            name: "Regular Fit",
            slug: "regular-fit",
            description: "Regular fit tee with reinforced neckline.",
            sizes: ["S", "M", "L", "XL"],
            colors: [
              { name: "White", code: "#FFFFFF" },
              { name: "Black", code: "#111111" },
              { name: "Heather Grey", code: "#9A9A9A" },
            ],
          },
        ],
      },
      {
        name: "Streetwear Co",
        slug: "streetwear-co",
        description: "Boxy-fit streetwear tees.",
        bannerCount: 2,
        products: [
          {
            name: "Boxy Tee",
            slug: "boxy-tee",
            description: "Boxy-fit drop-shoulder tee.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Off White", code: "#F1EDE5" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Polo Shirts",
    slug: "polo-shirts",
    description: "Smart-casual polos with pique cotton and clean tailoring.",
    brands: [
      {
        name: "Executive Polo",
        slug: "executive-polo",
        description: "Refined pique polos.",
        bannerCount: 2,
        products: [
          {
            name: "Tipped Collar",
            slug: "tipped-collar",
            description: "Pique polo with tipped collar.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Navy", code: "#1B2A4A" },
              { name: "White", code: "#FFFFFF" },
              { name: "Sky Blue", code: "#8FB4D9" },
            ],
          },
        ],
      },
      {
        name: "Court Polo",
        slug: "court-polo",
        description: "Sport-inspired polos.",
        bannerCount: 2,
        products: [
          {
            name: "Mesh Back",
            slug: "mesh-back",
            description: "Sport polo with contrast placket.",
            sizes: ["S", "M", "L", "XL"],
            colors: [
              { name: "White", code: "#FFFFFF" },
              { name: "Navy", code: "#1B2A4A" },
              { name: "Green", code: "#2F6B3B" },
            ],
          },
        ],
      },
      {
        name: "Heritage Polo",
        slug: "heritage-polo",
        description: "Vintage-inspired polos.",
        bannerCount: 2,
        products: [
          {
            name: "Heavy Pique",
            slug: "heavy-pique",
            description: "Heavy pique polo with lived-in softness.",
            sizes: ["M", "L", "XL", "XXL"],
            colors: [
              { name: "Beige", code: "#C9B48F" },
              { name: "Brown", code: "#5B3A24" },
            ],
          },
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
        description: "Professional chef aprons.",
        bannerCount: 2,
        products: [
          {
            name: "Stain-Resist",
            slug: "stain-resist",
            description: "Stain-resistant chef apron.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "White", code: "#FFFFFF" },
            ],
          },
        ],
      },
      {
        name: "Bistro Apron",
        slug: "bistro-apron",
        description: "Half-length bistro aprons.",
        bannerCount: 2,
        products: [
          {
            name: "Half Length",
            slug: "half-length",
            description: "Twin-pocket bistro apron.",
            sizes: ["M", "L"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Navy", code: "#1B2A4A" },
            ],
          },
        ],
      },
      {
        name: "Workshop Apron",
        slug: "workshop-apron",
        description: "Heavy-duty canvas aprons.",
        bannerCount: 2,
        products: [
          {
            name: "Canvas Pro",
            slug: "canvas-pro",
            description: "Cross-back canvas apron.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Khaki", code: "#B8A47A" },
              { name: "Black", code: "#111111" },
            ],
          },
        ],
      },
      {
        name: "Canvas Apron",
        slug: "canvas-apron",
        description: "Everyday canvas aprons.",
        bannerCount: 2,
        products: [
          {
            name: "Everyday",
            slug: "everyday",
            description: "Everyday canvas apron.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Natural", code: "#E8DDBE" },
              { name: "Olive", code: "#5A6B3B" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    description: "Warm, heavyweight hoodies in brushed fleece.",
    brands: [
      {
        name: "Fleece Hoodie",
        slug: "fleece-hoodie",
        description: "320 GSM brushed fleece hoodies.",
        bannerCount: 2,
        products: [
          {
            name: "Classic Pullover",
            slug: "classic-pullover",
            description: "Classic kangaroo-pocket hoodie.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Grey", code: "#7E7E7E" },
              { name: "Navy", code: "#1B2A4A" },
            ],
          },
        ],
      },
      {
        name: "Zip-Up Classic",
        slug: "zip-up-classic",
        description: "Full-zip hoodies.",
        bannerCount: 2,
        products: [
          {
            name: "Full Zip",
            slug: "full-zip",
            description: "Metal zip hoodie with ribbed cuffs.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Navy", code: "#1B2A4A" },
            ],
          },
        ],
      },
      {
        name: "Oversized Hoodie",
        slug: "oversized-hoodie",
        description: "Boxy oversized hoodies.",
        bannerCount: 2,
        products: [
          {
            name: "Boxy Oversized",
            slug: "boxy-oversized",
            description: "Dropped shoulder oversized hoodie.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Cream", code: "#F1EDE5" },
              { name: "Olive", code: "#5A6B3B" },
            ],
          },
        ],
      },
      {
        name: "Vintage Hoodie",
        slug: "vintage-hoodie",
        description: "Garment-dyed hoodies.",
        bannerCount: 2,
        products: [
          {
            name: "Faded",
            slug: "faded",
            description: "Garment-dyed faded hoodie.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Washed Grey", code: "#A5A5A5" },
              { name: "Faded Black", code: "#2A2A2A" },
            ],
          },
        ],
      },
    ],
  },
];

const BANNERS: BannerInput[] = [
  {
    image: img("banner-hero-1", 1920, 720),
    title: "SS Executive Offer's",
    subtitle: "Premium T-Shirts, Polos, Aprons & Hoodies.",
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
    description: "Combed cotton texture.",
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

async function clearAll() {
  const productsSnap = await getDocs(collection(db, "products"));
  for (const p of productsSnap.docs) {
    const colors = await getDocs(collection(db, "products", p.id, "colors"));
    await Promise.all(colors.docs.map((c) => deleteDoc(c.ref)));
  }
  await Promise.all(productsSnap.docs.map((p) => deleteDoc(p.ref)));

  const brandsSnap = await getDocs(collection(db, "brands"));
  await Promise.all(brandsSnap.docs.map((b) => deleteDoc(b.ref)));

  const catsSnap = await getDocs(collection(db, "categories"));
  await Promise.all(catsSnap.docs.map((c) => deleteDoc(c.ref)));

  const bannersSnap = await getDocs(collection(db, "banners"));
  await Promise.all(bannersSnap.docs.map((b) => deleteDoc(b.ref)));

  const gallerySnap = await getDocs(collection(db, "gallery"));
  await Promise.all(gallerySnap.docs.map((g) => deleteDoc(g.ref)));
}

type Step = { label: string; status: "pending" | "running" | "done" };
const INITIAL_STEPS: Step[] = [
  { label: "Clearing existing data", status: "pending" },
  { label: "Creating categories", status: "pending" },
  { label: "Creating brands & products", status: "pending" },
  { label: "Creating banners", status: "pending" },
  { label: "Creating gallery images", status: "pending" },
];

export default function SeedPage() {
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  const setStep = (i: number, status: Step["status"]) =>
    setSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, status } : s)),
    );

  const reset = () => {
    setSteps(INITIAL_STEPS);
    setDone(false);
  };

  const run = async () => {
    setRunning(true);
    reset();

    try {
      setStep(0, "running");
      await clearAll();
      setStep(0, "done");
      toast.success("Cleared", "All previous data removed.");

      setStep(1, "running");
      const categoryIds: string[] = [];
      for (const cat of CATEGORIES) {
        const input: CategoryInput = {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: img(`cat-${cat.slug}`, 1200, 600),
        };
        categoryIds.push(await createCategory(input));
      }
      setStep(1, "done");
      toast.success("Categories created", `${CATEGORIES.length} added.`);

      setStep(2, "running");
      let brandCount = 0;
      let productCount = 0;
      let colorCount = 0;

      for (let ci = 0; ci < CATEGORIES.length; ci++) {
        const cat = CATEGORIES[ci];
        const categoryId = categoryIds[ci];

        for (const brand of cat.brands) {
          const bannerImages = Array.from(
            { length: brand.bannerCount },
            (_, i) => img(`brand-${brand.slug}-banner-${i + 1}`, 1600, 900),
          );

          const brandInput: BrandInput = {
            name: brand.name,
            slug: brand.slug,
            description: brand.description,
            categoryId,
            bannerImages,
          };
          const brandId = await createBrand(brandInput);
          brandCount++;

          for (const product of brand.products) {
            const productInput: ProductInput = {
              name: product.name,
              slug: product.slug,
              description: product.description,
              brandId,
              categoryId,
              images: [
                img(`product-${brand.slug}-${product.slug}-1`, 800, 800),
                img(`product-${brand.slug}-${product.slug}-2`, 800, 800),
              ],
              sizes: product.sizes,
            };
            const productId = await createProduct(productInput);
            productCount++;

            for (const c of product.colors) {
              const colorInput: ColorInput = {
                name: c.name,
                code: c.code,
                image: img(
                  `color-${product.slug}-${c.code.replace("#", "")}`,
                  800,
                  800,
                ),
              };
              await createProductColor(productId, colorInput);
              colorCount++;
            }
          }
        }
      }
      setStep(2, "done");
      toast.success(
        "Catalogue created",
        `${brandCount} brands · ${productCount} products · ${colorCount} colours.`,
      );

      setStep(3, "running");
      for (const b of BANNERS) await createBanner(b);
      setStep(3, "done");
      toast.success("Banners created", `${BANNERS.length} added.`);

      setStep(4, "running");
      for (const g of GALLERY) await createGalleryImage(g);
      setStep(4, "done");
      toast.success("Gallery created", `${GALLERY.length} images added.`);

      setDone(true);
    } catch (e) {
      console.error(e);
      toast.error("Seeding failed", "Check console for details.");
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "running" ? { ...s, status: "pending" } : s,
        ),
      );
    } finally {
      setRunning(false);
    }
  };

  const totalBrands = CATEGORIES.reduce((s, c) => s + c.brands.length, 0);
  const totalProducts = CATEGORIES.reduce(
    (s, c) => s + c.brands.reduce((x, b) => x + b.products.length, 0),
    0,
  );
  const totalColors = CATEGORIES.reduce(
    (s, c) =>
      s +
      c.brands.reduce(
        (x, b) => x + b.products.reduce((y, p) => y + p.colors.length, 0),
        0,
      ),
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
              <Stat label="Products" value={totalProducts} />
              <Stat label="Colours" value={totalColors} />
            </div>

            <ul className="space-y-2 text-[13px] leading-6 text-black/70">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#B80A0B]" />
                  <span>
                    <strong>{cat.name}</strong> — {cat.brands.length} brands ·{" "}
                    {cat.brands.reduce((s, b) => s + b.products.length, 0)}{" "}
                    products
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-start gap-3 rounded-md border border-[#B80A0B]/20 bg-[rgba(184,10,11,0.04)] px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B80A0B]" />
              <p className="text-[13px] leading-6 text-[#B80A0B]">
                <strong>This wipes everything.</strong> All existing categories,
                brands, products, colours, banners and gallery images will be
                permanently deleted before the new data is inserted.
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
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Progress" />
          <CardBody>
            <ol className="space-y-3">
              {steps.map((step, i) => (
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
                      i + 1
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
