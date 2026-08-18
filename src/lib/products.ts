import type { Product, ProductSpecs, Requirements } from "@/types";

const DUMMY_BASE = "https://dummyjson.com";

interface DummyProduct {
  id: number;
  title: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  thumbnail: string;
  images: string[];
  description: string;
  discountPercentage: number;
  stock: number;
  tags: string[];
}

// Deterministic pseudo-random generator so specs are stable per product id
function seeded(id: number): () => number {
  let s = id * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const SMARTPHONE_BATTERIES = [
  "4000mAh",
  "4500mAh",
  "5000mAh",
  "5000mAh",
  "6000mAh",
];
const SMARTPHONE_DISPLAYS = [
  '6.1" AMOLED 90Hz',
  '6.5" AMOLED 120Hz',
  '6.7" IPS 120Hz',
  '6.4" AMOLED 120Hz',
  '6.1" IPS 60Hz',
];
const SMARTPHONE_PERFS = [
  "Snapdragon 7 Gen 1",
  "Snapdragon 8 Gen 2",
  "MediaTek Dimensity 7000",
  "Snapdragon 6 Gen 1",
  "Tensor G3",
];
const SMARTPHONE_CAMERAS = [
  "50MP + 12MP",
  "108MP + 16MP + 8MP",
  "64MP + 12MP",
  "50MP + 50MP + 12MP",
  "200MP + 12MP",
];
const SMARTPHONE_STORAGES = [
  "128GB",
  "256GB",
  "128GB",
  "256GB",
  "512GB",
];

const LAPTOP_RAMS = ["8GB", "16GB", "16GB", "32GB", "8GB"];
const LAPTOP_CPUS = [
  "Intel i5-13400H",
  "Intel i7-13600H",
  "Ryzen 5 7530U",
  "Ryzen 7 7735HS",
  "Apple M2",
];
const LAPTOP_DISPLAYS = [
  '14" FHD IPS',
  '15.6" FHD IPS',
  '14" 2.8K OLED',
  '16" QHD IPS 165Hz',
  '13.3" Retina',
];
const LAPTOP_STORAGES = ["256GB SSD", "512GB SSD", "1TB SSD", "512GB SSD", "256GB SSD"];
const LAPTOP_BATTERIES = ["8 hrs", "10 hrs", "12 hrs", "6 hrs", "14 hrs"];

const HEADPHONE_BATTERIES = ["20 hrs", "30 hrs", "40 hrs", "24 hrs", "60 hrs"];
const HEADPHONE_SOUNDS = [
  "Active noise cancellation",
  "Active noise cancellation",
  "Passive isolation",
  "ANC + transparency",
  "Spatial audio",
];
const HEADPHONE_COMFORTS = [
  "Over-ear memory foam",
  "In-ear silicone",
  "Over-ear plush",
  "On-ear padded",
  "In-ear gel tips",
];

const GENERIC_BATTERIES = ["10 hrs", "12 hrs", "8 hrs", "16 hrs", "6 hrs"];

function synthesizeSpecs(p: DummyProduct): ProductSpecs {
  const rng = seeded(p.id);
  const cat = p.category;
  const titleLower = p.title.toLowerCase();
  const tagsLower = (p.tags || []).join(" ").toLowerCase();

  const specs: ProductSpecs = {};

  if (cat.includes("smartphone") || cat.includes("phone")) {
    specs.battery = pick(rng, SMARTPHONE_BATTERIES);
    specs.display = pick(rng, SMARTPHONE_DISPLAYS);
    specs.performance = pick(rng, SMARTPHONE_PERFS);
    specs.camera = pick(rng, SMARTPHONE_CAMERAS);
    specs.storage = pick(rng, SMARTPHONE_STORAGES);
    if (titleLower.includes("gaming") || tagsLower.includes("gaming")) {
      specs.gaming = "High refresh + gaming chipset";
    }
  } else if (cat.includes("laptop") || cat.includes("notebook")) {
    specs.performance = pick(rng, LAPTOP_CPUS);
    specs.storage = pick(rng, LAPTOP_STORAGES);
    specs.display = pick(rng, LAPTOP_DISPLAYS);
    specs.battery = pick(rng, LAPTOP_BATTERIES);
    specs.portability = pick(rng, ["1.4 kg", "1.8 kg", "2.1 kg", "1.2 kg", "1.6 kg"]);
    if (titleLower.includes("gaming") || tagsLower.includes("gaming")) {
      specs.gaming = "Dedicated GPU + 165Hz";
    }
  } else if (cat.includes("headphone") || cat.includes("earphone") || cat.includes("speaker")) {
    specs.battery = pick(rng, HEADPHONE_BATTERIES);
    specs.sound = pick(rng, HEADPHONE_SOUNDS);
    specs.comfort = pick(rng, HEADPHONE_COMFORTS);
    specs.weight = pick(rng, ["250g", "45g", "310g", "180g", "520g"]);
  } else if (cat.includes("watch")) {
    specs.battery = pick(rng, ["24 hrs", "36 hrs", "18 hrs", "7 days", "48 hrs"]);
    specs.display = pick(rng, ['1.4" AMOLED', '1.9" AMOLED', '1.2" IPS', '1.78" OLED']);
    specs.durability = pick(rng, ["5ATM water resistant", "IP68", "3ATM", "MIL-STD-810"]);
    specs.fitness = "Heart rate, SpO2, GPS";
  } else if (cat.includes("camera")) {
    specs.camera = pick(rng, ["24MP APS-C", "26MP full-frame", "20MP 1-inch", "45MP full-frame"]);
    specs.performance = pick(rng, ["10 fps burst", "6 fps burst", "20 fps burst", "12 fps burst"]);
    specs.display = pick(rng, ['3" touchscreen', '3.2" vari-angle', '3" OLED EVF']);
    specs.weight = pick(rng, ["650g", "420g", "850g", "510g"]);
  } else if (cat.includes("television") || cat.includes("tv")) {
    specs.display = pick(rng, ['55" 4K OLED', '65" 4K QLED', '50" 4K LED', '43" Full HD', '75" 4K Mini-LED']);
    specs.sound = pick(rng, ["Dolby Atmos 40W", "Dolby Atmos 20W", "DTS:X 30W", "Stereo 16W"]);
    specs.performance = pick(rng, ["Quad-core 4K HDR", "Quad-core 8K upscaler", "Octa-core 4K 120Hz"]);
  } else if (cat.includes("tablet")) {
    specs.display = pick(rng, ['10.9" IPS', '11" LCD 120Hz', '12.9" OLED', '10.4" IPS']);
    specs.battery = pick(rng, ["10 hrs", "12 hrs", "8 hrs", "14 hrs"]);
    specs.performance = pick(rng, ["Snapdragon 8 Gen 2", "A16 Bionic", "Tensor G2", "Helio G99"]);
    specs.storage = pick(rng, ["64GB", "128GB", "256GB", "128GB"]);
  } else if (cat.includes("shoe")) {
    specs.comfort = pick(rng, ["Cushioned foam midsole", "React foam", "Air cushioning", "Gel padding"]);
    specs.durability = pick(rng, ["Rubber outsole", "Carbon rubber", "Gum rubber", "EVA + rubber"]);
    specs.weight = pick(rng, ["280g", "320g", "250g", "350g"]);
  } else if (cat.includes("bag") || cat.includes("backpack")) {
    specs.storage = pick(rng, ["25L", "30L", "18L", "40L"]);
    specs.durability = pick(rng, ["Water-resistant nylon", "Ripstop polyester", "Canvas"]);
    specs.weight = pick(rng, ["0.9 kg", "1.2 kg", "0.7 kg", "1.5 kg"]);
  } else if (cat.includes("sunglasses")) {
    specs.design = pick(rng, ["Polarized UV400", "Mirrored UV400", "Gradient lens", "Photochromic"]);
    specs.weight = pick(rng, ["28g", "32g", "25g", "40g"]);
  } else if (cat.includes("fragrance")) {
    specs.design = pick(rng, ["Eau de parfum", "Eau de toilette", "Parfum"]);
    specs.weight = pick(rng, ["50ml", "100ml", "30ml", "75ml"]);
  } else {
    specs.battery = pick(rng, GENERIC_BATTERIES);
    specs.design = pick(rng, ["Minimalist", "Modern", "Classic", "Premium build"]);
  }

  specs.price = `$${p.price}`;
  return specs;
}

function toProduct(p: DummyProduct): Product {
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    price: p.price,
    rating: p.rating,
    category: p.category,
    thumbnail: p.thumbnail,
    images: p.images,
    description: p.description,
    discountPercentage: p.discountPercentage,
    stock: p.stock,
    tags: p.tags || [],
    specs: synthesizeSpecs(p),
  };
}

export async function fetchProducts(
  req: Requirements,
): Promise<Product[]> {
  const category = req.category;
  let url: string;

  if (req.searchKeywords && req.searchKeywords.length > 0) {
    const q = encodeURIComponent(req.searchKeywords.join(" "));
    url = `${DUMMY_BASE}/products/search?q=${q}&limit=30&select=id,title,brand,price,rating,category,thumbnail,images,description,discountPercentage,stock,tags`;
  } else if (category) {
    url = `${DUMMY_BASE}/products/category/${category}?limit=30&select=id,title,brand,price,rating,category,thumbnail,images,description,discountPercentage,stock,tags`;
  } else {
    url = `${DUMMY_BASE}/products?limit=30&select=id,title,brand,price,rating,category,thumbnail,images,description,discountPercentage,stock,tags`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Product fetch failed (${res.status})`);

  const data = await res.json();
  const items: DummyProduct[] = data.products || [];

  // If keyword search returned too few, fall back to category
  if (items.length < 5 && category) {
    const catUrl = `${DUMMY_BASE}/products/category/${category}?limit=30&select=id,title,brand,price,rating,category,thumbnail,images,description,discountPercentage,stock,tags`;
    const catRes = await fetch(catUrl);
    if (catRes.ok) {
      const catData = await catRes.json();
      const catItems: DummyProduct[] = catData.products || [];
      if (catItems.length > items.length) {
        return catItems.map(toProduct);
      }
    }
  }

  return items.map(toProduct);
}
