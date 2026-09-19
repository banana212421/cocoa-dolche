import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export function BackToCategories() {
  const { itemCount } = useCart();

  return (
    <div className="flex items-center justify-between gap-2">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/">
          <ArrowLeft /> All categories
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link to="/cart">
          <ShoppingCart /> Cart
          {itemCount > 0 && <Badge variant="secondary">{itemCount}</Badge>}
        </Link>
      </Button>
    </div>
  );
}
