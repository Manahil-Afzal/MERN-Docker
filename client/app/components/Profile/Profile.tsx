"use client";

import React, { FC, useEffect, useState, useMemo } from "react";
import SideBarProfile from "./SideBarProfile";
import "../../globals.css";
import { useLogOutMutation } from "../../../redux/features/auth/authApi";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ProfileInfo from "../Profile/ProfileInfo";
import ChangePassword from "./ChangePassword";
import CourseCard from "../Course/CourseCard";
import { useGetUserAllCoursesQuery } from "@/redux/features/courses/coursesApi";

interface UserCourse {
  courseId?: string;
  _id?: string;
}

interface UserType {
  name?: string;
  role?: string;
  avatar?: {
    url?: string | null;
  } | null;
  courses?: (string | UserCourse)[];
}

interface RootState {
  auth: {
    user: UserType | null;
  };
}

type Props = {
  user: UserType;
};

type CourseType = {
  _id: string;
  name: string;
  thumbnail: {
    url: string;
  };
  ratings?: number;
  purchased?: number;
  price: number;
  estimatedPrice?: number;
  courseData?: unknown[];
};

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false);
  const [avatar] = useState<string | null>(null);
  const [logOut] = useLogOutMutation();
  const router = useRouter();
  const { data, isLoading } = useGetUserAllCoursesQuery(undefined, {});
  const [active, setActive] = useState(1);

  const Courses = useMemo(() => {
    if (!data?.courses || !user?.courses?.length) {
      return [];
    }

    return user.courses
      .map((userCourse: string | UserCourse) => {
        const userCourseId =
          typeof userCourse === "string"
            ? userCourse
            : userCourse.courseId || userCourse._id;

        return (data.courses as Array<{ _id: string }>).find(
          (course) => String(course._id) === String(userCourseId)
        );
      })
      .filter(
        (course): course is CourseType =>
          course !== undefined
      );
  }, [data, user]);

  const logOutHandler = async () => {
    try {
      await signOut({ redirect: false });
      await logOut().unwrap();

      toast.success("Logged out successfully!");

      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };

      toast.error(err?.data?.message || "Logout failed");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full flex flex-row justify-center mx-auto gap-4 800px:gap-10 pb-10 min-h-screen">
      <div className="w-[98%] 800px:w-[95%] max-w-[1200px] flex flex-row gap-4 800px:gap-10">
        {/* Sidebar Container */}
        <div
          className={`transition-all duration-300 z-[999] h-max
            sticky top-[100px]
            ${active === 3 ? "mt-40" : "mt-30"}
            ${active === 3
              ? "w-[160px] 800px:w-[390px]"
              : "w-[160px] 800px:w-[310px]"
            }
            bg-white dark:bg-[#111c43] 800px:bg-transparent
            rounded-[10px] border dark:border-[#ffffff1d] 800px:border-none`}
          style={{ touchAction: "pan-y" }}
        >
          <SideBarProfile
            user={user}
            active={active}
            avatar={avatar}
            setActive={setActive}
            logOutHandler={logOutHandler}
            isScrolling={scroll}
          />
        </div>

        {/* Content Area */}
        <div
          className={`flex-1 transition-all duration-200 ${active === 3 ? "mt-32" : "mt-20"
            }`}
        >
          {active === 1 && (
            <div className="w-full">
              <ProfileInfo avatar={avatar} user={user} />
            </div>
          )}

          {active === 2 && (
            <div className="w-full">
              <ChangePassword avatar={avatar} user={user} />
            </div>
          )}

          {active === 3 && (
            <div className="w-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <p className="dark:text-white">Loading...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {Courses.length > 0 ? (
                    Courses.map((item, index) => (
                      <CourseCard
                        key={index}
                        item={item}
                        user={user}
                        isProfile={true}
                      />
                    ))
                  ) : (
                    <h1 className="text-center text-[18px] font-Poppins col-span-full mt-10 dark:text-white">
                      No enrolled courses found.
                    </h1>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;