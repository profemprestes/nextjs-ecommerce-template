"use client";
import React from "react";
import { Product } from "@/types/product";
import SingleGridItem from "@/components/Shop/SingleGridItem";

const ProductItem = ({ item }: { item: Product }) => {
  return <SingleGridItem item={item} />;
};

export default ProductItem;
