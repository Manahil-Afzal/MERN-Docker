import Ratings from "@/app/utils/Ratings";
import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";
import { AiOutlineUnorderedList } from "react-icons/ai";

type CourseCardItem = {
  _id: string;
  name: string;
  thumbnail: { url: string };
  ratings?: number;
  purchased?: number;
  price: number;
  estimatedPrice?: number;
  courseData?: Array<unknown>;
};

type Props = {
  item: CourseCardItem;
  isProfile?: boolean;
  compact?: boolean;
  user?: unknown;
};

const CourseCard: FC<Props> = ({ item, isProfile, compact = false }) => {
  return (
    <Link
      href={!isProfile ? `/course/${item._id}` : `/course-access/${item._id}`}
    >
      <div
        className={`dark:bg-slate-500 dark:bg-opacity-20 backdrop-blur border dark:border-[#ffffff1d] border-[#00000015] rounded-lg shadow-sm dark:shadow-inner ${
          compact
            ? "w-60 min-h-[25vh] p-4 pr-2"
            : "w-full min-h-[30vh] p-5 pr-3"
        }`}
      >
        <Image
          src={item.thumbnail.url}
          width={500}
          height={300}
          className={`rounded-lg object-cover w-full ${compact ? "h-[140px]" : "h-auto"}`}
          alt={item.name}
        />
        <h1
          className={`font-Poppins text-black dark:text-white mt-3 ${
            compact ? "text-[14px] leading-5" : "text-[16px]"
          }`}
        >
          {item.name}
        </h1>
        <div className="w-full flex items-center justify-between pt-2">
          <Ratings rating={item.ratings ?? 0} />
          <h5
            className={`text-black dark:text-white ${
              isProfile && "hidden 800px:inline"
            }`}
          >
            {item.purchased} Students
          </h5>
        </div>

        <div className="w-full flex items-center justify-between pt-3">
          <div className="flex">
            <h3 className="text-black dark:text-white">
              {/* FIXED: Added '0' to the comparison */}
              {item.price === 0 ? "Free" : item.price + "$"}
            </h3>
            <h5 className="pl-3 text-[14px] mt-[-5px] line-through opacity-80 text-black dark:text-white">
              {item.estimatedPrice}$
            </h5>
          </div>

          <div className="flex items-center pb-3">
            {/* FIXED: Removed hardcoded #fff fill so it shows in light mode */}
            <AiOutlineUnorderedList
              size={20}
              className="text-black dark:text-white"
            />
            <h5 className="pl-2 text-black dark:text-white">
              {item.courseData?.length} Lectures
            </h5>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
