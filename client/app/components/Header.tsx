"use client";
import Link from "next/link";
import "../globals.css";
import React, { FC, useState, useEffect } from "react";
import NavItems from "../utils/NavItems";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import MobileSidebar from "./MobileSidebar";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import CustomModal from "../utils/CustomModal";
import Login from "../components/Auth/Login";
import SignUp from "../components/Auth/SignUp";
import Verification from "../components/Auth/verification";
import { useSelector } from "react-redux";
import Image from "next/image";
import avatar from "../../public/assests/avatar.png";
import { useSession } from "next-auth/react";
import { useSocialAuthMutation } from "@/redux/features/auth/authApi";
import { toast } from "react-hot-toast";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
  route: string;
  setRoute: (route: string) => void;
};

interface User {
  avatar?: {
    url?: string;
  };
}

const Header: FC<Props> = ({ activeItem, route, setOpen, open, setRoute }) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [active, setActive] = useState(false);

  const { user } = useSelector(
    (state: { auth: { user: User | null } }) => state.auth,
  );
  const { data } = useSession();

  const [socialAuth, { isSuccess }] = useSocialAuthMutation();

  useEffect(() => {
    if (!user && data) {
      socialAuth({
        email: data?.user?.email || "",
        name: data?.user?.name || "",
        avatar: data?.user?.image || "",
      });
    }

    if (data === null && isSuccess) {
      toast.success("Login Successfully");
    }
  }, [data, user, isSuccess, socialAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setActive(window.scrollY > 80);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const imageSrc =
    typeof user?.avatar?.url === "string" && user.avatar.url
      ? user.avatar.url
      : avatar;

  return (
    <div className="w-full relative">
      <div
        className={`${active
          ? "dark:bg-linear-to-r dark:bg-gray-800 dark:via-purple-950 dark:to-purple-700 bg-white fixed top-0 left-0 w-full h-20 z-80 border-b dark:border-purple-900 border-gray-200 shadow-xl transition duration-500"
          : "w-full dark:bg-linear-to-r dark:bg-gray-800 dark:via-purple-950 dark:to-purple-700 bg-white border-b dark:border-purple-900 border-gray-200 h-20 z-80 shadow"
          }`}
      >
        <div className="w-[95%] m-auto py-2 h-full">
          <div className="w-full h-20 flex items-center justify-between p-3">
            <Link
              href="/"
              className="text-[25px] font-Poppins font-medium text-black dark:text-white"
            >
              ZyLO Learning
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex">
                <NavItems isMobile={false} />
              </div>

              <ThemeSwitcher />

              <div className="md:hidden">
                <HiOutlineMenuAlt3
                  size={25}
                  className="cursor-pointer dark:text-white text-black"
                  onClick={() => setOpenSidebar(true)}
                />
              </div>

              {user ? (
                <Link href="/profile">
                  <Image
                    src={imageSrc}
                    alt="User avatar"
                    width={30}
                    height={30}
                    className="w-[30px] h-[30px] rounded-full cursor-pointer object-cover"
                  />
                </Link>
              ) : (
                <HiOutlineUserCircle
                  size={25}
                  className="hidden md:block cursor-pointer dark:text-white text-black"
                  onClick={() => {
                    if (setOpen) setOpen(true);
                    setRoute("Login");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {route === "Login" && open && (
        <CustomModal
          open={open}
          setOpen={setOpen!}
          setRoute={setRoute}
          activeItem={activeItem}
          component={Login}
        />
      )}

      {route === "Sign-Up" && open && (
        <CustomModal
          open={open}
          setOpen={setOpen!}
          setRoute={setRoute}
          activeItem={activeItem}
          component={SignUp}
        />
      )}

      {route === "verification" && open && (
        <CustomModal
          open={open}
          setOpen={setOpen!}
          setRoute={setRoute}
          activeItem={activeItem}
          component={Verification}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <MobileSidebar
        activeItem={activeItem}
        open={openSidebar}
        setOpen={setOpenSidebar}
        user={user}
        setRoute={setRoute}
        setOpenModal={setOpen}
      />
    </div>
  );
};

export default Header;
