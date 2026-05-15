"use client";

import { useState } from "react";
import { Heart, ShoppingBag, AlertCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/store/cart";
import { getDeliveryMode } from "@/types";
import type { Product, ProductVariant } from "@/types";

interface Props {
  product: Product;
}

export function VariantSelector({ product }: Props) {
  const { variants = [] } = product;

  // Extraer valores únicos de talla y color
  const sizes = [
    ...new Set(
      variants
        .map((v) => v.attributes.talla)
        .filter(Boolean) as string[]
    ),
  ];
  const colors = [
    ...new Set(
      variants
        .map((v) => v.attributes.color)
        .filter(Boolean) as string[]
    ),
  ];

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<"ok" | "error" | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  // Encontrar variante que coincide con selección
  const selectedVariant: ProductVariant | undefined = variants.find((v) => {
    const sizeMatch = !sizes.length || v.attributes.talla === selectedSize;
    const colorMatch = !colors.length || v.attributes.color === selectedColor;
    return sizeMatch && colorMatch;
  });

  const available = selectedVariant
    ? selectedVariant.available_stock ?? Math.max(0, selectedVariant.stock - selectedVariant.reserved)
    : 0;

  const deliveryMode = selectedVariant ? getDeliveryMode(selectedVariant) : null;

  // A variant is sellable if it has pre-stock OR bajo_demanda is enabled (RB-INV)
  function variantSellable(v: ProductVariant) {
    const mode = getDeliveryMode(v);
    return mode === "fast" || mode === "on_demand";
  }

  // Product is sold out only when no variant is sellable (respects dual inventory)
  const isSoldOut = variants.length > 0 && variants.every((v) => getDeliveryMode(v) === "sold_out");
  const variantSellableNow = selectedVariant ? variantSellable(selectedVariant) : false;
  const canAddToCart =
    !isSoldOut &&
    selectedVariant &&
    variantSellableNow &&
    (!sizes.length || selectedSize) &&
    (!colors.length || selectedColor);

  // Verificar qué tallas/colores tienen stock o bajo demanda habilitado
  function sizeHasStock(size: string) {
    return variants.some(
      (v) =>
        v.attributes.talla === size &&
        (!selectedColor || v.attributes.color === selectedColor) &&
        variantSellable(v)
    );
  }
  function colorHasStock(color: string) {
    return variants.some(
      (v) =>
        v.attributes.color === color &&
        (!selectedSize || v.attributes.talla === selectedSize) &&
        variantSellable(v)
    );
  }

  async function handleAddToCart() {
    if (!canAddToCart || !selectedVariant) return;
    setAdding(true);
    setFeedback(null);

    const ok = await addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0] ?? "",
      sku: selectedVariant.sku,
      attributes: selectedVariant.attributes,
      quantity,
      unitPrice: selectedVariant.price ?? product.base_price,
    });

    setFeedback(ok ? "ok" : "error");
    setAdding(false);
  }

  return (
    <div className="space-y-5">
      {/* TALLAS */}
      {sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600]">
              Talla{selectedSize ? `: ${selectedSize}` : ""}
            </span>
            <button className="text-[10px] text-[#B5888A] underline underline-offset-2">
              Guía de tallas
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const hasStock = sizeHasStock(size);
              return (
                <button
                  key={size}
                  onClick={() => hasStock && setSelectedSize(size === selectedSize ? null : size)}
                  disabled={!hasStock}
                  className={cn(
                    "w-10 h-10 text-xs font-[500] border transition-colors",
                    selectedSize === size
                      ? "border-[#3D2B1F] bg-[#3D2B1F] text-white"
                      : hasStock
                      ? "border-[#DDD5C4] text-[#3D2B1F] hover:border-[#897568]"
                      : "border-[#DDD5C4] text-[#CEC3AB] cursor-not-allowed line-through"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* COLORES */}
      {colors.length > 0 && (
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] block mb-2.5">
            Color{selectedColor ? `: ${selectedColor}` : ""}
          </span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const hasStock = colorHasStock(color);
              return (
                <button
                  key={color}
                  onClick={() => hasStock && setSelectedColor(color === selectedColor ? null : color)}
                  disabled={!hasStock}
                  className={cn(
                    "px-4 h-9 text-xs font-[400] border transition-colors",
                    selectedColor === color
                      ? "border-[#3D2B1F] bg-[#3D2B1F] text-white"
                      : hasStock
                      ? "border-[#DDD5C4] text-[#3D2B1F] hover:border-[#897568]"
                      : "border-[#DDD5C4] text-[#CEC3AB] cursor-not-allowed line-through"
                  )}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BADGE DE ENTREGA */}
      {selectedVariant && deliveryMode && (
        <div className="flex items-center gap-1.5">
          {deliveryMode === "fast" && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-[500]">
              <Zap size={9} /> Entrega rápida 1-3 días
            </span>
          )}
          {deliveryMode === "on_demand" && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-[500]">
              <Clock size={9} /> Bajo demanda · {selectedVariant.tiempo_produccion_dias ?? 3} días prod. + envío
            </span>
          )}
          {deliveryMode === "sold_out" && (
            <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 font-[500]">
              Agotado
            </span>
          )}
        </div>
      )}

      {/* CANTIDAD */}
      {!isSoldOut && selectedVariant && variantSellableNow && (
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] block mb-2.5">
            Cantidad
          </span>
          <div className="flex items-center border border-[#DDD5C4] w-fit">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-[#897568] hover:text-[#3D2B1F] text-lg"
            >
              −
            </button>
            <span className="w-10 text-center text-sm text-[#3D2B1F] font-[500]">
              {quantity}
            </span>
            <button
              onClick={() => {
                // Pre-stock: cap at available; bajo_demanda: no cap (unlimited on demand)
                const max = deliveryMode === "fast" ? available : 99;
                setQuantity((q) => Math.min(max, q + 1));
              }}
              className="w-10 h-10 flex items-center justify-center text-[#897568] hover:text-[#3D2B1F] text-lg"
            >
              +
            </button>
          </div>
          {deliveryMode === "fast" && available <= 5 && (
            <p className="text-xs text-[#B5888A] mt-1.5">
              Solo {available} disponibles
            </p>
          )}
        </div>
      )}

      {/* BOTONES */}
      <div className="flex flex-col gap-3 pt-2">
        {isSoldOut || (selectedVariant && deliveryMode === "sold_out") ? (
          <button
            disabled
            className="w-full py-4 bg-[#CEC3AB] text-[#897568] text-[11px] tracking-[0.2em] uppercase font-[500] cursor-not-allowed"
          >
            Agotado
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || adding}
            className={cn(
              "w-full py-4 flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] uppercase font-[500] transition-colors",
              canAddToCart && !adding
                ? "bg-[#3D2B1F] text-[#F3EDE0] hover:bg-[#5A3E2E]"
                : "bg-[#CEC3AB] text-[#897568] cursor-not-allowed"
            )}
          >
            <ShoppingBag size={15} strokeWidth={1.5} />
            {adding ? "Añadiendo..." : "Añadir al carrito"}
          </button>
        )}

        <button className="w-full py-3 border border-[#DDD5C4] flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] uppercase font-[500] text-[#897568] hover:border-[#B5888A] hover:text-[#B5888A] transition-colors">
          <Heart size={14} strokeWidth={1.5} />
          Añadir a favoritos
        </button>
      </div>

      {/* FEEDBACK */}
      {feedback === "ok" && (
        <p className="text-xs text-green-600 flex items-center gap-1.5">
          ✓ Producto añadido al carrito
        </p>
      )}
      {feedback === "error" && (
        <p className="text-xs text-[#B5888A] flex items-center gap-1.5">
          <AlertCircle size={12} />
          No fue posible agregar al carrito. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}
