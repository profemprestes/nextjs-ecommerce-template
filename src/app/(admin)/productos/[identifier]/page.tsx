import type { Metadata } from "next";
import {
  PRODUCT_INCLUDE_IMAGES,
  ensureDatabaseReady,
  isDatabaseConfigured,
  serializeProduct,
} from "@/lib/prisma";
import type { SportProduct } from "@/lib/catalog-schema";
import { ProductDetailPage } from "@/components/ProductDetailPage";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ identifier: string }>;
  searchParams?: Promise<{ from?: string }>;
};

async function findProductByIdentifier(rawIdentifier: string): Promise<{
  product: SportProduct | null;
  relatedVariants: SportProduct[];
  allProducts: SportProduct[];
  storageMode: "database" | "local";
}> {
  if (!isDatabaseConfigured()) {
    return {
      product: null,
      relatedVariants: [],
      allProducts: [],
      storageMode: "local",
    };
  }

  try {
    const decoded = decodeURIComponent(rawIdentifier).trim();
    const normalizedSlug = decoded.toLowerCase();
    const baseSlug = normalizedSlug.replace(/-v\d+$/, "");
    const prisma = await ensureDatabaseReady();

    const row = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: normalizedSlug },
          ...(baseSlug !== normalizedSlug ? [{ slug: baseSlug }] : []),
          { uid: decoded },
          { id: decoded },
          { id: decoded.toUpperCase() },
        ],
      },
      include: PRODUCT_INCLUDE_IMAGES,
    });

    if (!row) {
      return {
        product: null,
        relatedVariants: [],
        allProducts: [],
        storageMode: "database",
      };
    }

    const product = serializeProduct(row);

    const [variantRows, allRows] = await Promise.all([
      row.item_group_id
        ? prisma.product.findMany({
            where: {
              item_group_id: row.item_group_id,
              active: true,
            },
            include: PRODUCT_INCLUDE_IMAGES,
            orderBy: { title: "asc" },
          })
        : Promise.resolve([]),
      prisma.product.findMany({
        where: { active: true },
        include: PRODUCT_INCLUDE_IMAGES,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return {
      product,
      relatedVariants: variantRows.map(serializeProduct),
      allProducts: allRows.map(serializeProduct),
      storageMode: "database",
    };
  } catch (error) {
    console.error("[ProductPage] Error al consultar producto:", error);
    return {
      product: null,
      relatedVariants: [],
      allProducts: [],
      storageMode: "local",
    };
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { identifier } = await params;
  const { product } = await findProductByIdentifier(identifier);

  if (!product) {
    return {
      title: "Producto no encontrado · Fútbol en la Piel",
      description: "Ficha de producto deportivo en Fútbol en la Piel.",
    };
  }

  return {
    title: `${product.title || product.id} · Fútbol en la Piel`,
    description:
      product.description ||
      `Ficha técnica de ${product.title || product.id} en Fútbol en la Piel.`,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: PageProps) {
  const { identifier } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const backHref = resolvedSearch?.from === "mauricio" ? "/mauricio" : "/admin";
  const { product, relatedVariants, allProducts, storageMode } =
    await findProductByIdentifier(identifier);

  return (
    <ProductDetailPage
      identifier={identifier}
      initialProduct={product}
      relatedVariants={relatedVariants}
      allProductsForValidation={allProducts}
      storageMode={storageMode}
      backHref={backHref}
    />
  );
}
