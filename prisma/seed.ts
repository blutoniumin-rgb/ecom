import bcrypt from "bcryptjs";
import { gstAmount, gstRateForPrice, type GstBands } from "../lib/gst";
import { prisma } from "../lib/prisma";

const bands: GstBands = {
  gstThreshold: 1000,
  gstLowRate: 5,
  gstHighRate: 12,
};

const categories = [
  { slug: "new-in", name: "New in", sortOrder: 0 },
  { slug: "coats", name: "Coats", sortOrder: 1 },
  { slug: "tops", name: "Tops", sortOrder: 2 },
  { slug: "knitwear", name: "Knitwear", sortOrder: 3 },
] as const;

type ProductSeed = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  active: boolean;
  sizes: string;
  colors: string;
  imageUrls: string[];
  categorySlug: (typeof categories)[number]["slug"];
};

const products: ProductSeed[] = [
  {
    name: "Cropped Trench Coat",
    slug: "cropped-trench-coat",
    sku: "WR-CT-0142",
    description:
      "A short cotton-blend trench with a storm flap and belt. Cut to sit at the hip over jeans or a slip dress.",
    price: 4290,
    mrp: 4990,
    stock: 18,
    active: true,
    sizes: "XS,S,M,L",
    colors: "Stone,Black",
    imageUrls: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "coats",
  },
  {
    name: "Oversized Wool Overcoat",
    slug: "oversized-wool-overcoat",
    sku: "WR-CT-0208",
    description:
      "Heavy wool overcoat with dropped shoulders and a clean notched lapel. Lined so it wears over knits.",
    price: 7890,
    mrp: 8990,
    stock: 9,
    active: true,
    sizes: "S,M,L,XL",
    colors: "Camel,Charcoal",
    imageUrls: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "coats",
  },
  {
    name: "Leather Biker Jacket",
    slug: "leather-biker-jacket",
    sku: "WR-CT-0311",
    description:
      "Soft lambskin biker with an asymmetric zip and snap collar. Slightly cropped, worn in from the first day.",
    price: 6490,
    mrp: 7490,
    stock: 6,
    active: true,
    sizes: "XS,S,M,L",
    colors: "Black,Burgundy",
    imageUrls: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "coats",
  },
  {
    name: "Square-Neck Camisole",
    slug: "square-neck-camisole",
    sku: "WR-TP-1104",
    description:
      "Bias-cut camisole in a smooth satin finish. Square neck, thin straps, meant to show under an open coat.",
    price: 890,
    mrp: 1290,
    stock: 40,
    active: true,
    sizes: "XS,S,M,L",
    colors: "Ivory,Blush",
    imageUrls: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "tops",
  },
  {
    name: "Boxy Cotton Shirt",
    slug: "boxy-cotton-shirt",
    sku: "WR-TP-1188",
    description:
      "Washed cotton shirt with a relaxed boxy body and mother-of-pearl buttons. Wear tucked or open.",
    price: 1890,
    mrp: 2190,
    stock: 24,
    active: true,
    sizes: "XS,S,M,L,XL",
    colors: "White,Sky",
    imageUrls: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "tops",
  },
  {
    name: "Ribbed Tank",
    slug: "ribbed-tank",
    sku: "WR-TP-1210",
    description:
      "Fine rib tank with a high neck and a long line. A base layer that also works on its own.",
    price: 690,
    mrp: 890,
    stock: 55,
    active: true,
    sizes: "XS,S,M,L",
    colors: "Black,White,Lilac",
    imageUrls: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "tops",
  },
  {
    name: "Chunky Collar Cardigan",
    slug: "chunky-collar-cardigan",
    sku: "WR-KN-2044",
    description:
      "Hand-feel wool blend cardigan with a wide collar and horn buttons. Oversized, hip length.",
    price: 3490,
    mrp: 3990,
    stock: 14,
    active: true,
    sizes: "S,M,L",
    colors: "Oat,Forest",
    imageUrls: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "knitwear",
  },
  {
    name: "Fine Merino Crew",
    slug: "fine-merino-crew",
    sku: "WR-KN-2102",
    description:
      "Lightweight merino crew with a clean neckline. Layer under the trench or wear alone.",
    price: 2490,
    mrp: 2890,
    stock: 22,
    active: true,
    sizes: "XS,S,M,L,XL",
    colors: "Navy,Cream,Black",
    imageUrls: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "knitwear",
  },
  {
    name: "Mohair Blend Pullover",
    slug: "mohair-blend-pullover",
    sku: "WR-KN-2186",
    description:
      "Fuzzy mohair-blend pullover with a slightly sheer knit. Soft halo, easy over a camisole.",
    price: 2890,
    mrp: 3290,
    stock: 11,
    active: true,
    sizes: "XS,S,M,L",
    colors: "Butter,Rose",
    imageUrls: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "knitwear",
  },
  {
    name: "Satin Slip Mini",
    slug: "satin-slip-mini",
    sku: "WR-NI-3001",
    description:
      "New-in bias satin mini with a cowl neck. Lightweight, with a short side slit.",
    price: 2190,
    mrp: 2590,
    stock: 16,
    active: true,
    sizes: "XS,S,M,L",
    colors: "Champagne,Black",
    imageUrls: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "new-in",
  },
  {
    name: "Tailored Hourglass Blazer",
    slug: "tailored-hourglass-blazer",
    sku: "WR-NI-3044",
    description:
      "New-in single-breasted blazer with a nipped waist and padded shoulder. Works over the merino crew.",
    price: 4590,
    mrp: 5290,
    stock: 8,
    active: true,
    sizes: "XS,S,M,L",
    colors: "Black,Ivory",
    imageUrls: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "new-in",
  },
  {
    name: "Wide-Leg Trouser",
    slug: "wide-leg-trouser",
    sku: "WR-NI-3090",
    description:
      "New-in high-rise wide leg in a fluid crepe. Pressed crease, full length, side pockets.",
    price: 2790,
    mrp: 3190,
    stock: 0,
    active: false,
    sizes: "XS,S,M,L,XL",
    colors: "Chocolate,Black",
    imageUrls: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
    ],
    categorySlug: "new-in",
  },
];

function lineFor(product: { id: string; name: string; sku: string; price: number }, quantity: number) {
  const rate = gstRateForPrice(product.price, bands);
  const unitGst = gstAmount(product.price, bands);
  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    unitPrice: product.price,
    quantity,
    gstRate: rate,
    gstAmount: unitGst * quantity,
    lineSubtotal: product.price * quantity,
    lineGst: unitGst * quantity,
  };
}

async function main() {
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  await prisma.storeSetting.create({
    data: {
      id: "singleton",
      storeName: "Wearism",
      supportEmail: "hello@wearism.dev",
      gstThreshold: bands.gstThreshold,
      gstLowRate: bands.gstLowRate,
      gstHighRate: bands.gstHighRate,
    },
  });

  await prisma.user.create({
    data: {
      name: "Wearism Admin",
      email: "admin@wearism.dev",
      phone: "9810000001",
      passwordHash: bcrypt.hashSync("admin12345", 10),
      role: "admin",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Ananya Iyer",
      email: "ananya@wearism.dev",
      phone: "9845012345",
      passwordHash: bcrypt.hashSync("customer12345", 10),
      role: "customer",
      addresses: {
        create: {
          name: "Ananya Iyer",
          phone: "9845012345",
          line1: "14 Residency Road",
          line2: "Flat 3B",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560025",
          isDefault: true,
        },
      },
    },
    include: { addresses: true },
  });

  const address = customer.addresses[0];

  const categoryRows = await Promise.all(
    categories.map((category) => prisma.category.create({ data: category })),
  );
  const categoryId = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

  const created = await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          active: product.active,
          sizes: product.sizes,
          colors: product.colors,
          imageUrls: JSON.stringify(product.imageUrls),
          categoryId: categoryId[product.categorySlug],
        },
      }),
    ),
  );

  const bySlug = Object.fromEntries(created.map((product) => [product.slug, product]));

  await prisma.review.createMany({
    data: [
      {
        productId: bySlug["cropped-trench-coat"].id,
        userId: customer.id,
        authorName: customer.name,
        rating: 5,
        body: "The length is exactly right and the belt actually stays put. Wore it over the merino crew.",
      },
      {
        productId: bySlug["fine-merino-crew"].id,
        userId: customer.id,
        authorName: customer.name,
        rating: 4,
        body: "Soft and not itchy. Runs slightly roomy in the shoulder.",
      },
      {
        productId: bySlug["satin-slip-mini"].id,
        userId: customer.id,
        authorName: customer.name,
        rating: 5,
        body: "The champagne colour is quieter in person. Fabric feels expensive.",
      },
    ],
  });

  const placedLines = [
    lineFor(bySlug["square-neck-camisole"], 1),
    lineFor(bySlug["ribbed-tank"], 2),
  ];
  const placedSubtotal = placedLines.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const placedGst = placedLines.reduce((sum, line) => sum + line.lineGst, 0);

  await prisma.order.create({
    data: {
      userId: customer.id,
      status: "placed",
      paymentMethod: "cod",
      paymentStatus: "pending",
      subtotal: placedSubtotal,
      gst: placedGst,
      total: placedSubtotal + placedGst,
      addressName: address.name,
      addressPhone: address.phone,
      addressLine1: address.line1,
      addressLine2: address.line2,
      addressCity: address.city,
      addressState: address.state,
      addressPostal: address.postalCode,
      items: {
        create: placedLines.map(({ lineSubtotal: _s, lineGst: _g, ...item }) => item),
      },
    },
  });

  const shippedLine = lineFor(bySlug["oversized-wool-overcoat"], 1);
  const shipped = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "shipped",
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      subtotal: shippedLine.lineSubtotal,
      gst: shippedLine.lineGst,
      total: shippedLine.lineSubtotal + shippedLine.lineGst,
      addressName: address.name,
      addressPhone: address.phone,
      addressLine1: address.line1,
      addressLine2: address.line2,
      addressCity: address.city,
      addressState: address.state,
      addressPostal: address.postalCode,
      items: {
        create: [
          {
            productId: shippedLine.productId,
            name: shippedLine.name,
            sku: shippedLine.sku,
            unitPrice: shippedLine.unitPrice,
            quantity: shippedLine.quantity,
            gstRate: shippedLine.gstRate,
            gstAmount: shippedLine.gstAmount,
          },
        ],
      },
    },
  });

  await prisma.shipment.create({
    data: {
      orderId: shipped.id,
      carrier: "Delhivery",
      trackingNumber: "WRSM3921847601",
      events: JSON.stringify([
        { at: "2026-10-11T06:40:00.000Z", label: "Picked up from Wearism warehouse" },
        { at: "2026-10-12T11:15:00.000Z", label: "In transit to Bengaluru hub" },
        { at: "2026-10-14T04:05:00.000Z", label: "Out for delivery" },
      ]),
    },
  });

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
