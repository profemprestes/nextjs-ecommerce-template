import React from "react";
import Hero from "./Hero";
import TeamTicker from "./TeamTicker";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";
import Testimonials from "./Testimonials";
import PromoBanner from "./PromoBanner";
import shopData from "@/components/Shop/shopData";
import { Product } from "@/types/product";

interface HomeProps {
  initialProducts?: Product[];
}

const Home = ({ initialProducts }: HomeProps) => {
  const products = initialProducts ?? shopData;

  return (
    <main>
      <Hero products={products} />
      <TeamTicker products={products} />
      <BestSeller initialProducts={products} />
      <NewArrival />
      <Testimonials />
      <PromoBanner />
    </main>
  );
};

export default Home;
