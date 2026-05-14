"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatCOP, discountPercent } from "@/lib/utils/format";
import { DeliveryBadge } from "./DeliveryBadge";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const price = product.effective_price ?? product.base_price;
  const isOnSale = product.is_on_sale && product.compare_price;
  const isSoldOut = product.is_sold_out || product.delivery_mode === "sold_out";

  return (
    <article className="group relative">
      {/* IMAGEN */}
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e0c8]">
          {product.images.length > 0 ? (
            <Image
              src={product.images[imgIdx]}
              alt={product.name}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-500",
                "group-hover:scale-105",
                isSoldOut && "opacity-60"
              )}
              onMouseEnter={() => product.images.length > 1 && setImgIdx(1)}
              onMouseLeave={() => setImgIdx(0)}
            />
          ) : (
            <div className="absolute inset-0 bg-[#e8e0c8] flex items-center justify-center">
              <span
                className="text-3xl text-[#6a6356]"
                style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}
              >
                Ricamo
              </span>
            </div>
          )}

          {/* BADGES superiores */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isSoldOut && (
              <span className="bg-[#0e0e0e] text-[#faf7f1] text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 font-[500]">
                Agotado
              </span>
            )}
            {isOnSale && !isSoldOut && (
              <span className="bg-[#b85539] text-white text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 font-[500]">
                -{discountPercent(product.compare_price!, price)}%
              </span>
            )}
          </div>

          {/* BADGE entrega — solo si no agotado */}
          {!isSoldOut && product.delivery_mode && (
            <div className="absolute bottom-2 left-2">
              <DeliveryBadge
                mode={product.delivery_mode}
                dias={product.tiempo_produccion_dias}
              />
            </div>
          )}

          {/* WISHLIST */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setWishlisted((v) => !v);
            }}
            aria-label={wishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
            className={cn(
              "absolute top-2 right-2 p-1.5 transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              wishlisted
                ? "opacity-100 text-[#b85539]"
                : "text-[#6a6356] bg-white/80 hover:text-[#b85539]"
            )}
          >
            <Heart
              size={16}
              strokeWidth={1.5}
              fill={wishlisted ? "currentColor" : "none"}
            />
          </button>
        </div>
      </Link>

      {/* INFO */}
      <div className="mt-3">
        <Link href={`/producto/${product.slug}`}>
          <h3 className="text-sm text-[#0e0e0e] font-[400] leading-snug hover:text-[#6a6356] transition-colors truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm text-[#0e0e0e] font-[500]">
            {formatCOP(price)}
          </span>
          {isOnSale && product.compare_price && (
            <span className="text-xs text-[#6a6356] line-through">
              {formatCOP(product.compare_price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
