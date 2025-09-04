import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isLoggedIn } from "../../utils/auth";
import { showToast } from "../../utils/toast";
import { useCart } from "../../contexts/CartContext";
import { extractErrorMessage, isConcurrencyError } from "../../api/api";

// Adjust this type to match your actual product model if needed
type Product = {
  id: string | any; // may arrive as Guid-like object; we stringify below
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  description?: string;
};

type Props = {
  product: Product;
  index?: number;
  onProductDeleted?: () => void;
};

function ProductCard({ product, index }: Props) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [pending, setPending] = useState(false);

  const handleAddToCart = async () => {
    // Auth guard - check localStorage only (jwt, access_token, token). Do not count VITE_JWT for the guard.
    if (!isLoggedIn()) {
      showToast("Please log in to add items to your cart.", "error");
      navigate("/login");
      return;
    }

    if (product.stockQuantity <= 0) {
      showToast("Product is out of stock", "error");
      return;
    }

    if (pending) return; // single-flight: ignore rapid re-clicks
    setPending(true);

    const productId = String(product.id);

    try {
      await addToCart(productId, 1);
      showToast("Added to cart", "success");
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      
      // Check if this was a reconciled concurrency error
      if (isConcurrencyError(err)) {
        showToast("Cart updated", "success");
      } else {
        showToast(errorMessage, "error");
      }
      
      if (err?.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setPending(false);
    }
  };

  const outOfStock = (product?.stockQuantity ?? 0) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.4, 0.0, 0.2, 1] 
      }}
      className="rounded-2xl shadow p-4 flex flex-col gap-3"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover rounded-xl"
          loading="lazy"
        />
      ) : null}

      <div className="flex-1">
        <div className="font-semibold">{product.name}</div>
        <div className="text-sm opacity-80">
          {product.description ?? ""}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="font-bold">
          ${Number(product.price ?? 0).toFixed(2)}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={pending || outOfStock}
          className={`px-4 py-2 rounded-2xl ${
            pending || outOfStock
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-black text-white hover:opacity-90"
          }`}
          aria-disabled={pending || outOfStock}
          aria-busy={pending}
        >
          {outOfStock ? "Out of stock" : pending ? "Adding…" : "Add to cart"}
        </button>
      </div>
    </motion.div>
  );
}

export default ProductCard;