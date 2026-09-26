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

/* ------------------------------------------------------------------ */
/* Image helper — picsum with seeds = always loads, always consistent  */
/* ------------------------------------------------------------------ */

const img = (seed: string, w = 800, h = 800) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

/* ------------------------------------------------------------------ */
/* Mock data — real brands + realistic product names                   */
/* ------------------------------------------------------------------ */

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
        name: "US Polo Assn",
        slug: "us-polo-assn",
        description:
          "The official brand of the United States Polo Association. Classic American style since 1890.",
        bannerCount: 2,
        products: [
          {
            name: "Crew Neck Tee",
            slug: "crew-neck-tee",
            description:
              "180 GSM combed cotton crew-neck tee with USPA embroidery on chest. Pre-shrunk and colourfast.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "White", code: "#FFFFFF" },
              { name: "Navy", code: "#1B2A4A" },
              { name: "Olive", code: "#5A6B3B" },
            ],
          },
          {
            name: "Graphic Tee",
            slug: "graphic-tee",
            description:
              "Heavyweight 220 GSM tee with large heritage graphic print. Drop shoulders for a relaxed fit.",
            sizes: ["M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Sand", code: "#D8C3A5" },
            ],
          },
        ],
      },
      {
        name: "Lacoste",
        slug: "lacoste",
        description:
          "French elegance and sportswear heritage since 1933. The iconic crocodile logo.",
        bannerCount: 2,
        products: [
          {
            name: "Pima Cotton Tee",
            slug: "pima-cotton-tee",
            description:
              "Luxuriously soft Pima cotton tee with embroidered crocodile. Tailored fit.",
            sizes: ["S", "M", "L", "XL"],
            colors: [
              { name: "White", code: "#FFFFFF" },
              { name: "Navy", code: "#1B2A4A" },
              { name: "Sky Blue", code: "#8FB4D9" },
            ],
          },
        ],
      },
      {
        name: "Sunspel",
        slug: "sunspel",
        description:
          "British craftsmanship since 1860. The original inventors of the luxury t-shirt.",
        bannerCount: 2,
        products: [
          {
            name: "Classic T-Shirt",
            slug: "classic-t-shirt",
            description:
              "The world's finest t-shirt. Made from long-staple Supima cotton for unrivalled softness.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "White", code: "#FFFFFF" },
              { name: "Black", code: "#111111" },
              { name: "Grey Marl", code: "#9A9A9A" },
            ],
          },
        ],
      },
      {
        name: "Buck Mason",
        slug: "buck-mason",
        description:
          "American essentials built to last. California-designed, responsibly made.",
        bannerCount: 2,
        products: [
          {
            name: "Pima Curve-Hem Tee",
            slug: "pima-curve-hem-tee",
            description:
              "Signature curved hem tee in soft Pima cotton. The perfect everyday basic.",
            sizes: ["S", "M", "L", "XL"],
            colors: [
              { name: "Slate", code: "#5A6B7A" },
              { name: "Faded Black", code: "#2A2A2A" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Polo Shirts",
    slug: "polo-shirts",
    description:
      "Smart-casual polos with pique cotton and clean tailoring — perfect for uniforms and everyday wear.",
    brands: [
      {
        name: "Ralph Lauren",
        slug: "ralph-lauren",
        description:
          "The definitive American luxury lifestyle brand. Iconic Polo Player logo.",
        bannerCount: 2,
        products: [
          {
            name: "Custom Slim Fit Polo",
            slug: "custom-slim-fit-polo",
            description:
              "Classic pique polo with signature embroidered pony. Ribbed collar and cuffs.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Navy", code: "#1B2A4A" },
              { name: "White", code: "#FFFFFF" },
              { name: "Burgundy", code: "#5A1A28" },
              { name: "Forest Green", code: "#2F6B3B" },
            ],
          },
        ],
      },
      {
        name: "Lacoste",
        slug: "lacoste-polo",
        description:
          "The original polo shirt. Invented by René Lacoste in 1933. Iconic crocodile.",
        bannerCount: 2,
        products: [
          {
            name: "L.12.12 Original Polo",
            slug: "l1212-original-polo",
            description:
              "The world's first polo shirt. Made from petit piqué cotton. Ribbed collar, button placket.",
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
        name: "Fred Perry",
        slug: "fred-perry",
        description:
          "British subculture icon. The laurel wreath since 1952. Mod, punk, and Britpop heritage.",
        bannerCount: 2,
        products: [
          {
            name: "M3600 Twin Tipped Polo",
            slug: "m3600-twin-tipped-polo",
            description:
              "Signature twin-tipped collar and cuffs. Made from cotton pique. Slim fit.",
            sizes: ["S", "M", "L", "XL"],
            colors: [
              { name: "Black/White", code: "#111111" },
              { name: "Navy/Red", code: "#1B2A4A" },
              { name: "White/Black", code: "#FFFFFF" },
            ],
          },
        ],
      },
      {
        name: "Tommy Hilfiger",
        slug: "tommy-hilfiger",
        description:
          "Classic American cool. Iconic red, white, and blue flag logo.",
        bannerCount: 2,
        products: [
          {
            name: "Regular Fit Polo",
            slug: "regular-fit-polo",
            description:
              "Classic fit polo with embroidered flag logo. Pique cotton with a soft finish.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Navy", code: "#1B2A4A" },
              { name: "White", code: "#FFFFFF" },
              { name: "Sky Blue", code: "#8FB4D9" },
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
      "Durable, professional aprons for kitchens, salons, workshops and front-of-house.",
    brands: [
      {
        name: "Chef Works",
        slug: "chef-works",
        description:
          "The global leader in culinary apparel. Trusted by professional kitchens in 90+ countries.",
        bannerCount: 2,
        products: [
          {
            name: "Olympia Bib Apron",
            slug: "olympia-bib-apron",
            description:
              "Classic bib apron with adjustable neck strap and two front pockets. 65/35 poly-cotton blend.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "White", code: "#FFFFFF" },
              { name: "Navy", code: "#1B2A4A" },
            ],
          },
          {
            name: "Bistro Apron",
            slug: "bistro-apron",
            description:
              "Half-length bistro apron with twin front pockets and wide waist tie. Perfect for front-of-house.",
            sizes: ["M", "L"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Khaki", code: "#B8A47A" },
            ],
          },
        ],
      },
      {
        name: "Carhartt",
        slug: "carhartt",
        description:
          "Premium workwear built for the toughest jobs. Firm duck canvas construction.",
        bannerCount: 2,
        products: [
          {
            name: "Firm Duck Apron",
            slug: "firm-duck-apron",
            description:
              "12-ounce firm-hand cotton duck apron with four large pockets and tool loops.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Brown", code: "#5B3A24" },
              { name: "Black", code: "#111111" },
              { name: "Olive", code: "#5A6B3B" },
            ],
          },
        ],
      },
      {
        name: "Portland Apron Co",
        slug: "portland-apron-co",
        description:
          "Handcrafted in Portland, Oregon. Durable waxed canvas and leather aprons.",
        bannerCount: 2,
        products: [
          {
            name: "Waxed Canvas Apron",
            slug: "waxed-canvas-apron",
            description:
              "Waxed canvas apron with full-grain leather straps and cross-back design. Built to last a lifetime.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Tan", code: "#C9B48F" },
              { name: "Charcoal", code: "#3A3A3A" },
            ],
          },
        ],
      },
      {
        name: "San Jamar",
        slug: "san-jamar",
        description:
          "Professional foodservice solutions. Trusted by restaurants worldwide.",
        bannerCount: 2,
        products: [
          {
            name: "Flame-Resistant Apron",
            slug: "flame-resistant-apron",
            description:
              "36-inch flame-resistant apron with adjustable buckle strap. Meets ASTM standards.",
            sizes: ["L", "XL"],
            colors: [
              { name: "Red", code: "#B80A0B" },
              { name: "Yellow", code: "#D4A017" },
            ],
          },
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
        name: "Champion",
        slug: "champion",
        description:
          "Authentic American athletic heritage since 1919. Inventors of the reverse weave hoodie.",
        bannerCount: 2,
        products: [
          {
            name: "Reverse Weave Hoodie",
            slug: "reverse-weave-hoodie",
            description:
              "400 GSM Reverse Weave fleece. Patented 1930s technology resists shrinkage and maintains shape.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Grey", code: "#7E7E7E" },
              { name: "Navy", code: "#1B2A4A" },
              { name: "Maroon", code: "#6B1F2A" },
            ],
          },
          {
            name: "Powerblend Full-Zip",
            slug: "powerblend-full-zip",
            description:
              "Midweight 9 oz. cotton-poly fleece full-zip hoodie. Athletic fit with front pockets.",
            sizes: ["M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Navy", code: "#1B2A4A" },
            ],
          },
        ],
      },
      {
        name: "Carhartt WIP",
        slug: "carhartt-wip",
        description:
          "Workwear-inspired streetwear. Rugged construction meets contemporary design.",
        bannerCount: 2,
        products: [
          {
            name: "Hooded Sweatshirt",
            slug: "hooded-sweatshirt",
            description:
              "Heavyweight cotton-blend hoodie with kangaroo pocket and logo embroidery.",
            sizes: ["M", "L", "XL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Charcoal", code: "#3A3A3A" },
              { name: "Olive", code: "#5A6B3B" },
            ],
          },
        ],
      },
      {
        name: "The North Face",
        slug: "the-north-face",
        description:
          "Never stop exploring. Premium outdoor apparel and equipment since 1966.",
        bannerCount: 2,
        products: [
          {
            name: "Half Dome Pullover",
            slug: "half-dome-pullover",
            description:
              "Classic pullover hoodie with Half Dome logo. Brushed fleece interior for warmth.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "Navy", code: "#1B2A4A" },
              { name: "Grey", code: "#7E7E7E" },
            ],
          },
        ],
      },
      {
        name: "Gildan",
        slug: "gildan",
        description:
          "Everyday essentials at accessible prices. Soft cotton-blend fleece.",
        bannerCount: 2,
        products: [
          {
            name: "Heavy Blend Hoodie",
            slug: "heavy-blend-hoodie",
            description:
              "8 oz. 50/50 cotton-poly fleece hoodie. Double-lined hood with drawcord.",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
              { name: "Black", code: "#111111" },
              { name: "White", code: "#FFFFFF" },
              { name: "Red", code: "#B80A0B" },
            ],
          },
        ],
      },
    ],
  },
];

const BANNERS: BannerInput[] = [
  {
    image: img("banner-ss-executive-1", 1920, 720),
    title: "SS Executive Offer's",
    subtitle:
      "Premium T-Shirts, Polos, Aprons & Hoodies — bulk orders welcome.",
    link: "/brands",
    active: true,
  },
  {
    image: img("banner-ss-executive-2", 1920, 720),
    title: "New Season Arrivals",
    subtitle: "Fresh colours and fits added every month.",
    link: "/brands",
    active: true,
  },
];

const GALLERY: GalleryInput[] = [
  {
    image: img("gallery-studio-shoot", 1200, 1200),
    title: "Studio Shoot",
    description: "Behind the scenes of our latest collection.",
  },
  {
    image: img("gallery-fabric-closeup", 1200, 1200),
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
      /* Step 1 — Clear */
      setStep(0, "running");
      await clearAll();
      setStep(0, "done");
      toast.success("Cleared", "All previous data removed.");

      /* Step 2 — Categories */
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

      /* Step 3 — Brands + Products + Colors */
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

      /* Step 4 — Banners */
      setStep(3, "running");
      for (const b of BANNERS) await createBanner(b);
      setStep(3, "done");
      toast.success("Banners created", `${BANNERS.length} added.`);

      /* Step 5 — Gallery */
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
                <Link href="/admin/products" className="underline">
                  Products
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
