"use client";
import React, { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import avatar from "../../public/assests/avatar.png";
import { MdOutlineCancel } from "react-icons/md";
import { HiOutlineUserCircle } from "react-icons/hi";
import { useTheme } from "../utils/theme-provider";
import NavItems from "../utils/NavItems";

type Props = {
  activeItem: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  user?: {
    avatar?: {
      url?: string | null;
    } | null;
  } | null;

  setRoute?: (route: string) => void;
  setOpenModal?: (open: boolean) => void;
};

const MobileSidebar: FC<Props> = ({
  open,
  setOpen,
  user,
  setRoute,
  setOpenModal,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 z-40 md:hidden ${isDark ? "bg-gray-900/50" : "bg-black/30"
            }`}
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col md:hidden shadow-lg ${isDark ? "bg-gray-800" : "bg-white"
          } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" onClick={() => setOpen(false)}>
            ZyLO Learning
          </Link>

          <MdOutlineCancel
            size={26}
            onClick={() => setOpen(false)}
            className="cursor-pointer"
          />
        </div>

        <div className="flex-1">
          <NavItems isMobile={true} setOpen={setOpen} />
        </div>

        <div className="p-4 border-t flex justify-center">
          {user ? (
            <Link href="/profile" onClick={() => setOpen(false)}>
              <Image
                src={user?.avatar?.url || avatar}
                alt="profile"
                width={42}
                height={42}
                className="rounded-full"
              />
            </Link>
          ) : (
            <HiOutlineUserCircle
              size={34}
              className="cursor-pointer"
              onClick={() => {
                setOpen(false);
                setRoute?.("Login");
                setOpenModal?.(true);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;