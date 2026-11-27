import React from "react";
import Hero from "./Hero";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";
import Testimonials from "./Testimonials";
import PromoBanner from "./PromoBanner";
import { Product } from "@/types/product";

interface HomeProps {
  initialProducts?: Product[];
}

const Home = ({ initialProducts }: HomeProps) => {
  return (
    <main>
      <Hero />
      <NewArrival />
      <BestSeller initialProducts={initialProducts} />
      <Testimonials />
      <PromoBanner />
    </main>
  );
};

export default Home;
