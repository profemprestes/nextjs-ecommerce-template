import React from "react";
import Hero from "./Hero";
import NewArrival from "./NewArrivals";
import BestSeller from "./BestSeller";
import Testimonials from "./Testimonials";
import PromoBanner from "./PromoBanner";

const Home = () => {
  return (
    <main>
      <Hero />
      <NewArrival />
      <BestSeller />
      <Testimonials />
      <PromoBanner />
    </main>
  );
};

export default Home;
