'use client'

import React, { useState } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";
import Hero from "./components/Route/Hero";
import Courses from "./components/Route/Courses";
import Reviews from "./components/Route/Reviews";
import FAQ from "./components/FAQ/FAQ";
import Footer from "./components/Footer";

const Page = () => {
  const [open, setOpen] = useState(false);
  const activeItem = 6;
  const [route, setRoute] = useState("Login");

  return (
    <div>
      <Heading
        title="ZyLO"
        description="ZyLo is a platform for students to learn and get Help from teachers"
        keywords="Programming,MERN,Redux, Devops, Machine Learning"
      />

      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        setRoute={setRoute}
        route={route}
      />

      <Hero />
      <Courses />
      <Reviews />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Page;