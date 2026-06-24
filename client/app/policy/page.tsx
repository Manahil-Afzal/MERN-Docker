"use client";

import React, { useState } from "react";
import Heading from "../utils/Heading";
import Header from "../components/Header";
import Policy from "./Policy";
import Footer from "../components/Footer";

const Page = () => {
  const [open, setOpen] = useState(false);
  const activeItem = 2;
  const [route, setRoute] = useState("Login");

  return (
    <div>
      <Heading
        title="Policy - ZyLO Learning"
        description="ZyLO is a plateform for students to learn and get help from Teachers"
        keywords="Programming, MERN, Redux, Machine Learning"
      />

      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        setRoute={setRoute}
        route={route}
      />

      <Policy />
      <Footer />
    </div>
  );
};

export default Page;