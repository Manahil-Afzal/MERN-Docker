"use client";

import React, { useState } from "react";
import Protected from "../hooks/useProtected";
import Heading from "../utils/Heading";
import Header from "../components/Header";
import Profile from "../components/Profile/Profile";
import { useSelector } from "react-redux";

interface RootState {
  auth: {
    user: {
      name?: string;
      [key: string]: unknown;
    } | null;
  };
}

const Page = () => {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("Login");

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <div>
      <Protected>
        <Heading
          title={`${user?.name || "User"} Profile - ZyLO`}
          description="ZyLo is a platform for students to learn and get Help from teachers"
          keywords="Programming,MERN,Redux, Devops, Machine Learning"
        />

        <Header
          open={open}
          setOpen={setOpen}
          activeItem={0}
          setRoute={setRoute}
          route={route}
        />

        {user && <Profile user={user} />}
      </Protected>
    </div>
  );
};

export default Page;