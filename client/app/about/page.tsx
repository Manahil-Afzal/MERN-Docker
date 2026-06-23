"use client";
import React, { useState } from "react";
import Heading from "../utils/Heading";
import Header from "../components/Header";
import { useSelector } from "react-redux";
import About from "./About";

interface LoggedInUser {
  name: string;
}

const Page = () => {
  const [open, setOpen] = useState(false);
  const activeItem = 2;
  const [route, setRoute] = useState("Login");
  const { user } = useSelector((state: { auth: { user: LoggedInUser | null } }) => state.auth);

  return (
    <div>
      <Heading
        title={`${user?.name} profile - ZyLO Learning`}
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
      {/* <Profile user={user} /> */}
      <About />
    </div>
  );
};

export default Page;
