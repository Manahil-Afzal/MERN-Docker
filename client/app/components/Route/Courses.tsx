"use client";

import { useGetUserAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import React from "react";
import CourseCard from "../Course/CourseCard";

type CourseType = {
  _id: string;
  [key: string]: unknown;
};

const Courses = () => {
  const { data } = useGetUserAllCoursesQuery({});

  const courses: CourseType[] = data?.courses || [];

  return (
    <div>
      <div className="w-[90%] 800px:w-[80%] m-auto">
        <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:!leading-[60px] text-[#000] font-[700] tracking-tight">
          Expand Your Career{" "}
          <span className="bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#6366f1] bg-clip-text text-transparent">
            Opportunity
          </span>
          <br />
          <span className="block mt-4">
            Opportunity With Our Courses
          </span>
        </h1>

        <br />
        <br />

        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] 1500px:grid-cols-4 1500px:gap-[35px] mb-12 border-0">
          {courses.map((item: CourseType, index: number) => (
            <CourseCard
              item={item}
              key={item._id || index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;