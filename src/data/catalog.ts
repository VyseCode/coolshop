const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  image: string;
  position: number;
};

export type ProductSeed = {
  name: string;
  slug: string;
  brand: string;
  description: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  tags: string[];
  specs: { key: string; value: string }[];
};

export const categorySeeds: CategorySeed[] = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Laptops, audio, cameras, and the gear you reach for every day.",
    image: img("photo-1498049794561-7780e7231661"),
    position: 1,
  },
  {
    name: "Home",
    slug: "home",
    description: "Furniture, light, and kitchen tools for a calmer house.",
    image: img("photo-1519710164239-da123dc03ef4"),
    position: 2,
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Shoes, layers, and bags with a clean silhouette.",
    image: img("photo-1490481651871-ab68de25d43d"),
    position: 3,
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Training essentials that leave the house with you.",
    image: img("photo-1517836357463-d25dfeac3438"),
    position: 4,
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Daily care and fragrance, edited down to what works.",
    image: img("photo-1522335789203-aabd1fc54bc9"),
    position: 5,
  },
  {
    name: "Books",
    slug: "books",
    description: "Reading, notes, and cookbooks worth keeping out.",
    image: img("photo-1524995997946-a1c2e315a42f"),
    position: 6,
  },
];

export const productSeeds: ProductSeed[] = [
  {
    name: "Lumen Pocket Phone",
    slug: "lumen-pocket-phone",
    brand: "Lumen",
    description:
      "A compact phone with an all-day battery and a bright, easy screen. Built for people who want the essentials done well.",
    categorySlug: "electronics",
    price: 69900,
    compareAtPrice: 74900,
    images: [img("photo-1511707171634-5f897ff02aa9"), img("photo-1510557880182-3d4d3cba35a5")],
    stock: 18,
    rating: 4.6,
    reviewCount: 312,
    tags: ["phone", "mobile", "lumen"],
    specs: [
      { key: "Display", value: "6.1 inch OLED" },
      { key: "Battery", value: "Up to 28 hours" },
      { key: "Storage", value: "128 GB" },
    ],
  },
  {
    name: "Mare Eau de Parfum",
    slug: "mare-eau-de-parfum",
    brand: "Atelier Mare",
    description:
      "A citrus and cedar fragrance that stays close to the skin. One bottle covers the workday without turning sharp.",
    categorySlug: "beauty",
    price: 8400,
    images: [img("photo-1541643600914-78b084683601")],
    stock: 40,
    rating: 4.7,
    reviewCount: 128,
    tags: ["perfume", "fragrance", "cedar"],
    specs: [
      { key: "Size", value: "50 ml" },
      { key: "Notes", value: "Bergamot, cedar, musk" },
      { key: "Finish", value: "Eau de parfum" },
    ],
  },
  {
    name: "Coast Runner Sneakers",
    slug: "coast-runner-sneakers",
    brand: "Coastline",
    description:
      "Lightweight trainers with a cushioned sole for city miles and weekend walks. The white leather wipes clean.",
    categorySlug: "fashion",
    price: 12800,
    compareAtPrice: 14800,
    images: [img("photo-1542291026-7eec264c27ff"), img("photo-1460353581641-37baddab0c3d")],
    stock: 32,
    rating: 4.5,
    reviewCount: 540,
    tags: ["shoes", "sneakers", "running"],
    specs: [
      { key: "Upper", value: "Leather and mesh" },
      { key: "Drop", value: "8 mm" },
      { key: "Fit", value: "True to size" },
    ],
  },
  {
    name: "Oakline Lounge Chair",
    slug: "oakline-lounge-chair",
    brand: "Oakline",
    description:
      "A low oak chair with a firm wool seat. It anchors a living room without taking the whole floor.",
    categorySlug: "home",
    price: 42900,
    compareAtPrice: 49900,
    images: [img("photo-1567538096630-e0c55bd6374c"), img("photo-1506439773649-6e0eb8cfb237")],
    stock: 7,
    rating: 4.8,
    reviewCount: 86,
    tags: ["chair", "furniture", "oak"],
    specs: [
      { key: "Frame", value: "Solid oak" },
      { key: "Seat", value: "Wool blend" },
      { key: "Width", value: "72 cm" },
    ],
  },
  {
    name: "Northline Air 14",
    slug: "northline-air-14",
    brand: "Northline",
    description:
      "A thin 14-inch laptop for writing, calls, and light photo work. Quiet fans and a keyboard you can live on.",
    categorySlug: "electronics",
    price: 129900,
    compareAtPrice: 149900,
    images: [img("photo-1517336714731-489689fd1ca8"), img("photo-1496181133206-80ce9b88a853")],
    stock: 14,
    rating: 4.8,
    reviewCount: 1024,
    featured: true,
    tags: ["laptop", "computer", "northline"],
    specs: [
      { key: "Display", value: "14 inch 2.2K" },
      { key: "Memory", value: "16 GB" },
      { key: "Storage", value: "512 GB SSD" },
      { key: "Weight", value: "1.3 kg" },
    ],
  },
  {
    name: "Harbor Studio Headphones",
    slug: "harbor-studio-headphones",
    brand: "Harbor Audio",
    description:
      "Closed-back headphones with a warm, even sound. The cushioned band stays comfortable through a long session.",
    categorySlug: "electronics",
    price: 18900,
    compareAtPrice: 24900,
    images: [img("photo-1505740420928-5e560c06d30e")],
    stock: 46,
    rating: 4.7,
    reviewCount: 2310,
    featured: true,
    tags: ["headphones", "audio", "music"],
    specs: [
      { key: "Driver", value: "40 mm" },
      { key: "Connection", value: "Wireless and cable" },
      { key: "Battery", value: "30 hours" },
    ],
  },
  {
    name: "Mare Ceramic Lamp",
    slug: "mare-ceramic-lamp",
    brand: "Atelier Mare",
    description:
      "A glazed ceramic lamp that throws a warm pool of light. The shade is linen, and the cord is cloth.",
    categorySlug: "home",
    price: 8900,
    images: [img("photo-1507473885765-e6ed057f782c")],
    stock: 22,
    rating: 4.6,
    reviewCount: 190,
    featured: true,
    tags: ["lamp", "lighting", "ceramic"],
    specs: [
      { key: "Height", value: "42 cm" },
      { key: "Bulb", value: "E26, not included" },
      { key: "Shade", value: "Linen" },
    ],
  },
  {
    name: "Harbor Wool Overshirt",
    slug: "harbor-wool-overshirt",
    brand: "Harbor & Co",
    description:
      "A midweight wool overshirt that works over a tee or under a coat. Cut straight, with real pockets.",
    categorySlug: "fashion",
    price: 16800,
    compareAtPrice: 19800,
    images: [img("photo-1551028719-00167b16eac5")],
    stock: 19,
    rating: 4.4,
    reviewCount: 276,
    featured: true,
    tags: ["shirt", "wool", "jacket"],
    specs: [
      { key: "Fabric", value: "80% wool, 20% nylon" },
      { key: "Fit", value: "Straight" },
      { key: "Care", value: "Dry clean" },
    ],
  },
  {
    name: "Groundwork Yoga Mat",
    slug: "groundwork-yoga-mat",
    brand: "Groundwork",
    description:
      "A dense 5 mm mat that stays put on wood floors. It rolls small enough for the side of a bag.",
    categorySlug: "sports",
    price: 4200,
    images: [img("photo-1601925260368-ae2f83cf8b7f")],
    stock: 60,
    rating: 4.6,
    reviewCount: 803,
    featured: true,
    tags: ["yoga", "mat", "fitness"],
    specs: [
      { key: "Thickness", value: "5 mm" },
      { key: "Length", value: "180 cm" },
      { key: "Material", value: "Natural rubber" },
    ],
  },
  {
    name: "Atelier Daily Serum",
    slug: "atelier-daily-serum",
    brand: "Atelier Mare",
    description:
      "A light serum with vitamin C and glycerin. It sits under sunscreen and does not pill.",
    categorySlug: "beauty",
    price: 3600,
    compareAtPrice: 4200,
    images: [img("photo-1556228720-195a672e8a03")],
    stock: 54,
    rating: 4.5,
    reviewCount: 640,
    featured: true,
    tags: ["skincare", "serum", "face"],
    specs: [
      { key: "Size", value: "30 ml" },
      { key: "Key ingredient", value: "Vitamin C" },
      { key: "Skin", value: "All types" },
    ],
  },
  {
    name: "The Quiet Catalog",
    slug: "the-quiet-catalog",
    brand: "Fieldnote Press",
    description:
      "Essays on attention, shops, and the objects we keep. A small hardcover meant to be reread.",
    categorySlug: "books",
    price: 1800,
    images: [img("photo-1512820790803-83ca734da794")],
    stock: 80,
    rating: 4.9,
    reviewCount: 211,
    featured: true,
    tags: ["book", "essays", "hardcover"],
    specs: [
      { key: "Pages", value: "224" },
      { key: "Format", value: "Hardcover" },
      { key: "Language", value: "English" },
    ],
  },
  {
    name: "Kite Portable Speaker",
    slug: "kite-portable-speaker",
    brand: "Kite",
    description:
      "A palm-sized speaker with a clear midrange and a strap for a bike bag. It survives a light rain.",
    categorySlug: "electronics",
    price: 7900,
    compareAtPrice: 9900,
    images: [img("photo-1608043152269-423dbba4e7e1")],
    stock: 37,
    rating: 4.3,
    reviewCount: 455,
    featured: true,
    tags: ["speaker", "bluetooth", "audio"],
    specs: [
      { key: "Battery", value: "12 hours" },
      { key: "Resistance", value: "IPX5" },
      { key: "Weight", value: "340 g" },
    ],
  },
  {
    name: "Fieldnote Mirrorless Camera",
    slug: "fieldnote-mirrorless-camera",
    brand: "Fieldnote",
    description:
      "A small mirrorless body with a sharp kit lens. Color is honest, and the grip works with one hand.",
    categorySlug: "electronics",
    price: 89900,
    images: [img("photo-1516035069371-29a1b244cc32")],
    stock: 9,
    rating: 4.7,
    reviewCount: 388,
    tags: ["camera", "photo", "mirrorless"],
    specs: [
      { key: "Sensor", value: "24 MP APS-C" },
      { key: "Lens", value: "16-50 mm kit" },
      { key: "Video", value: "4K 30" },
    ],
  },
  {
    name: "Atelier Mechanical Keyboard",
    slug: "atelier-mechanical-keyboard",
    brand: "Atelier",
    description:
      "A compact mechanical keyboard with quiet tactile switches. The aluminum case stays cool and steady.",
    categorySlug: "electronics",
    price: 15900,
    images: [img("photo-1511467687858-23d96c32e4ae")],
    stock: 28,
    rating: 4.6,
    reviewCount: 712,
    tags: ["keyboard", "desk", "typing"],
    specs: [
      { key: "Layout", value: "75%" },
      { key: "Switches", value: "Tactile, factory lubed" },
      { key: "Connection", value: "USB-C or Bluetooth" },
    ],
  },
  {
    name: "Brume Pour-Over Kettle",
    slug: "brume-pour-over-kettle",
    brand: "Brume",
    description:
      "A gooseneck kettle with a steady pour and a stay-cool handle. Marked for one or two cups.",
    categorySlug: "home",
    price: 6400,
    images: [img("photo-1495474472287-4d71bcdd2085")],
    stock: 33,
    rating: 4.4,
    reviewCount: 142,
    tags: ["kettle", "coffee", "kitchen"],
    specs: [
      { key: "Capacity", value: "700 ml" },
      { key: "Material", value: "Stainless steel" },
      { key: "Heat", value: "Stovetop" },
    ],
  },
  {
    name: "Sunday Linen Throw",
    slug: "sunday-linen-throw",
    brand: "Sunday",
    description:
      "A washed linen throw in a sand tone. It softens after the first wash and lives on the sofa.",
    categorySlug: "home",
    price: 7200,
    compareAtPrice: 8800,
    images: [img("photo-1584100936595-c0654b55a2e2")],
    stock: 25,
    rating: 4.5,
    reviewCount: 97,
    tags: ["linen", "blanket", "throw"],
    specs: [
      { key: "Size", value: "140 × 200 cm" },
      { key: "Fabric", value: "100% linen" },
      { key: "Care", value: "Machine wash cold" },
    ],
  },
  {
    name: "Mare Leather Tote",
    slug: "mare-leather-tote",
    brand: "Atelier Mare",
    description:
      "An unlined leather tote that holds a laptop and a market run. The straps are long enough for a shoulder.",
    categorySlug: "fashion",
    price: 19800,
    images: [img("photo-1548036328-c9fa89d128fa")],
    stock: 16,
    rating: 4.8,
    reviewCount: 154,
    tags: ["bag", "tote", "leather"],
    specs: [
      { key: "Material", value: "Full-grain leather" },
      { key: "Laptop", value: "Fits 14 inch" },
      { key: "Closure", value: "Open top" },
    ],
  },
  {
    name: "Solstice Sunglasses",
    slug: "solstice-sunglasses",
    brand: "Solstice",
    description:
      "Acetate frames with grey lenses and a light weight. They fold flat into a shirt pocket.",
    categorySlug: "fashion",
    price: 4800,
    images: [img("photo-1511499767150-a48a237f0083")],
    stock: 48,
    rating: 4.2,
    reviewCount: 203,
    tags: ["sunglasses", "eyewear"],
    specs: [
      { key: "Lens", value: "Grey, UV400" },
      { key: "Frame", value: "Acetate" },
      { key: "Width", value: "145 mm" },
    ],
  },
  {
    name: "Iron & Pine Dumbbell Pair",
    slug: "iron-pine-dumbbell-pair",
    brand: "Iron & Pine",
    description:
      "A 10 lb pair with a powder coat that does not chip onto the floor. Hex ends keep them from rolling.",
    categorySlug: "sports",
    price: 8900,
    images: [img("photo-1576678927484-cc907957088c")],
    stock: 20,
    rating: 4.6,
    reviewCount: 119,
    tags: ["dumbbell", "weights", "strength"],
    specs: [
      { key: "Weight", value: "10 lb each" },
      { key: "Ends", value: "Hex rubber" },
      { key: "Handle", value: "Knurled steel" },
    ],
  },
  {
    name: "Trailmark Steel Bottle",
    slug: "trailmark-steel-bottle",
    brand: "Trailmark",
    description:
      "A 600 ml bottle that keeps water cold through a commute. The cap opens with one hand.",
    categorySlug: "sports",
    price: 2800,
    images: [img("photo-1602143407151-7111542de6e8")],
    stock: 70,
    rating: 4.4,
    reviewCount: 366,
    tags: ["bottle", "water", "travel"],
    specs: [
      { key: "Capacity", value: "600 ml" },
      { key: "Insulation", value: "Double wall" },
      { key: "Material", value: "Stainless steel" },
    ],
  },
  {
    name: "Northline Shave Kit",
    slug: "northline-shave-kit",
    brand: "Northline",
    description:
      "A safety razor, stand, and a small tub of cream. Fewer cartridges, a closer shave.",
    categorySlug: "beauty",
    price: 3200,
    images: [img("photo-1621607512214-68297480165e")],
    stock: 36,
    rating: 4.3,
    reviewCount: 88,
    tags: ["shave", "grooming", "razor"],
    specs: [
      { key: "Razor", value: "Safety, metal" },
      { key: "Cream", value: "Unscented, 80 ml" },
      { key: "Stand", value: "Included" },
    ],
  },
  {
    name: "Field Notes on Cities",
    slug: "field-notes-on-cities",
    brand: "Fieldnote Press",
    description:
      "A walking guide to streets, markets, and small museums. Written like a letter from a friend who lives there.",
    categorySlug: "books",
    price: 2200,
    images: [img("photo-1524995997946-a1c2e315a42f")],
    stock: 50,
    rating: 4.7,
    reviewCount: 64,
    tags: ["book", "travel", "cities"],
    specs: [
      { key: "Pages", value: "288" },
      { key: "Format", value: "Paperback" },
      { key: "Language", value: "English" },
    ],
  },
  {
    name: "Clothbound Notebook",
    slug: "clothbound-notebook",
    brand: "Fieldnote",
    description:
      "A lay-flat notebook with thick paper that takes fountain pen ink. The cover is book cloth.",
    categorySlug: "books",
    price: 2400,
    images: [img("photo-1516414447565-b14be0adf13e")],
    stock: 90,
    rating: 4.5,
    reviewCount: 430,
    tags: ["notebook", "journal", "paper"],
    specs: [
      { key: "Pages", value: "192, dotted" },
      { key: "Paper", value: "100 gsm" },
      { key: "Size", value: "A5" },
    ],
  },
  {
    name: "Kitchen Ledger",
    slug: "kitchen-ledger",
    brand: "Sunday Press",
    description:
      "Weeknight recipes with short lists and honest timing. The photos are of food you can actually plate.",
    categorySlug: "books",
    price: 2800,
    images: [img("photo-1466637574441-749b8f19452f")],
    stock: 44,
    rating: 4.6,
    reviewCount: 175,
    tags: ["cookbook", "recipes", "kitchen"],
    specs: [
      { key: "Recipes", value: "90" },
      { key: "Format", value: "Hardcover" },
      { key: "Pages", value: "256" },
    ],
  },
];
