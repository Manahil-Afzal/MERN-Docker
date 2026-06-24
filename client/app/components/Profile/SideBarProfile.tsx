import React, { FC } from "react";
import Image from "next/image";
import avatarDefault from "../../../public/assests/avatar.png";
import "../../globals.css";
import { RiLockPasswordLine } from "react-icons/ri";
import { SiCoursera } from "react-icons/si";
import { AiOutlineLogout } from "react-icons/ai";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import Link from "next/link";

interface UserType {
  role?: string;
  avatar?:
    | string
    | {
        url?: string;
      };
}

type LogOutHandler = () => void | Promise<void>;

type Props = {
  user: UserType;
  active: number;
  avatar: string | null;
  setActive: (active: number) => void;
  logOutHandler: LogOutHandler;
  isScrolling?: boolean;
};

const SideBarProfile: FC<Props> = ({
  user,
  active,
  avatar,
  setActive,
  logOutHandler,
  isScrolling,
}) => {
  const imageSrc =
    typeof user?.avatar === "string"
      ? user.avatar
      : user?.avatar?.url || avatar || avatarDefault;

  return (
    <div className="w-full flex flex-col">
      <div
        className={`w-full flex items-center px-3 py-4 cursor-pointer transition-all duration-200 ${
          active === 1
            ? "profile-sidebar-item-active"
            : "bg-transparent hover:bg-[#ffffff10]"
        } ${isScrolling ? "justify-center 800px:justify-start" : ""}`}
        onClick={() => setActive(1)}
      >
        <Image
          src={imageSrc}
          alt="Avatar"
          width={25}
          height={25}
          className="w-[25px] h-[25px] rounded-full"
        />

        <h5
          className={`pl-3 font-Poppins text-black dark:text-white ${
            isScrolling ? "hidden 800px:block" : "block"
          }`}
        >
          My Account
        </h5>
      </div>

      <div
        className={`w-full flex items-center px-3 py-4 cursor-pointer transition-all duration-200 ${
          active === 2
            ? "profile-sidebar-item-active"
            : "bg-transparent hover:bg-[#ffffff10]"
        } ${isScrolling ? "justify-center 800px:justify-start" : ""}`}
        onClick={() => setActive(2)}
      >
        <RiLockPasswordLine
          size={20}
          className="text-black dark:text-white"
        />

        <h5
          className={`pl-3 font-Poppins text-black dark:text-white ${
            isScrolling ? "hidden 800px:block" : "block"
          }`}
        >
          Password
        </h5>
      </div>

      <div
        className={`w-full flex items-center px-3 py-4 cursor-pointer transition-all duration-200 ${
          active === 3
            ? "profile-sidebar-item-active"
            : "bg-transparent hover:bg-[#ffffff10]"
        } ${isScrolling ? "justify-center 800px:justify-start" : ""}`}
        onClick={() => setActive(3)}
      >
        <SiCoursera
          size={20}
          className="text-black dark:text-white"
        />

        <h5
          className={`pl-3 font-Poppins text-black dark:text-white ${
            isScrolling ? "hidden 800px:block" : "block"
          }`}
        >
          Courses
        </h5>
      </div>

      {user?.role === "admin" && (
        <Link
          href="/admin"
          className={`w-full flex items-center px-3 py-4 cursor-pointer transition-all duration-200 ${
            active === 6
              ? "profile-sidebar-item-active"
              : "bg-transparent hover:bg-[#ffffff10]"
          } ${isScrolling ? "justify-center 800px:justify-start" : ""}`}
        >
          <MdOutlineAdminPanelSettings
            size={20}
            className="text-black dark:text-white"
          />

          <h5
            className={`pl-3 font-Poppins text-black dark:text-white ${
              isScrolling ? "hidden 800px:block" : "block"
            }`}
          >
            Admin
          </h5>
        </Link>
      )}

      <div
        className={`w-full flex items-center px-3 py-4 cursor-pointer transition-all duration-200 ${
          active === 4
            ? "profile-sidebar-item-active"
            : "bg-transparent hover:bg-[#ffffff10]"
        } ${isScrolling ? "justify-center 800px:justify-start" : ""}`}
        onClick={() => {
          setActive(4);
          void logOutHandler();
        }}
      >
        <AiOutlineLogout
          size={20}
          className="text-black dark:text-white"
        />

        <h5
          className={`pl-3 font-Poppins text-black dark:text-white ${
            isScrolling ? "hidden 800px:block" : "block"
          }`}
        >
          Log Out
        </h5>
      </div>
    </div>
  );
};

export default SideBarProfile;