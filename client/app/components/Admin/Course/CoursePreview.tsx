import React, { FC } from "react";
import CoursePlayer from "../../../utils/CoursePlayer";
import { styles } from "../../../styles/style";
import Ratings from "../../../../app/utils/Ratings";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseData?: {
    name?: string;
    demoUrl?: string;
    price?: number | string;
    estimatedPrice?: number | string;
    description?: string;
    benefits?: { title: string }[];
    prerequisites?: { title: string }[];
  };
  handleCourseCreate: () => void;
  isEdit?: boolean;
};

const CoursePreview: FC<Props> = ({
  courseData,
  handleCourseCreate,
  setActive,
  active,
  isEdit = false,
}) => {
  const coursePrice = Number(courseData?.price || 0);
  const estimatedPrice = Number(courseData?.estimatedPrice || 0);

  const discountPercentage =
    estimatedPrice > 0 ? ((estimatedPrice - coursePrice) / estimatedPrice) * 100 : 0;

  const discountPercentagePrice = discountPercentage.toFixed(0);

  const prevButton = () => {
    setActive(active - 1);
  }

  return (
    <div className="w-[80%] max-w-[1200px] mx-auto py-5 mb-5 px-4 800px:px-0">
      <div className="w-full relative">
        <div className="w-full mt-10">
          <CoursePlayer
            videoUrl={courseData?.demoUrl || ""}
            title={courseData?.name || ""}
          />
        </div>
        <div className="flex items-center">
          <h1 className="pt-5 text-[25px]">
            {coursePrice === 0 ? "Free" : coursePrice + "$"}
          </h1>
          <h5 className="pl-3 text-[20px] mt-2 line-through opacity-80">
            {estimatedPrice} $
          </h5>
          <h4 className="pl-5 pt-4 text-[22px]">
            {discountPercentagePrice}% Off
          </h4>
        </div>

        <div className="flex items-center">
          <div
            className={`${styles.button} w-[180px]! my-3 font-Poppins bg-purple-400 cursor-not-allowed`}
          >
            Buy Now {courseData?.price} $
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="text"
            name=""
            id=""
            placeholder="Discount Code..."
            className={`${styles.input} w-[480px]! 800px:w-[240px]! 1100px:w-[280px]! ml-3 mt-0!`}
          />
          <div
            className={`${styles.button}  bg-purple-400 w-[120px]! my-3 ml-4 font-Poppins cursor-pointer`}
          >
            Apply
          </div>
        </div>
        <p className="pb-1">. Source Code included</p>
        <p className="pb-1">. Full lifetime access</p>
        <p className="pb-1">. Certificate of Completion</p>
        <p className="pb-3 800px:pb-1">. Premium Support</p>
      </div>

      <div className="w-full">
        <div className="w-full 800px:pr-5">
          <h1 className="text-[25px] font-Poppins font-semibold">
            {courseData?.name}
          </h1>
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <Ratings rating={0} />
              <h5> 0 Reviews</h5>
            </div>
            <h5> 0 Students</h5>
          </div>
          <br />
          <h1 className="text-[25px] font-Poppins font-semibold">
            What you will learn from this course?
          </h1>
        </div>
        {courseData?.benefits?.map((item, index: number) => (
          <div className="w-full flex 800px:items-center py-2" key={index}>
            <div className="w-[15px] mr-1">
              <IoCheckmarkDoneOutline size={20} />
            </div>
            <p className="pl-2">{item.title}</p>
          </div>
        ))}
        <br />
        <br />

        <h1 className="text-[25px] font-Poppins font-semibold">
          What are the Prerequisites for starting this course?
        </h1>
        {courseData?.prerequisites?.map((item, index: number) => (
          <div className="w-full flex 800px:items-center py-2" key={index}>
            <div className="w-[15px] mr-1">
              <IoCheckmarkDoneOutline size={20} />
            </div>
            <p className="pl-2">{item.title}</p>
          </div>
        ))}
        <br />
        <br />

        {/* course description */}
        <div className="w-full">
          <h1 className="text-[25px] font-Poppins font-semibold">
            Course Details
          </h1>
          <p className="text-[18px] mt-5 whitespace-pre-line w-full overflow-hidden ">
            {courseData?.description}
          </p>
        </div>
        <br />
        <br />
      </div>

      <div className="w-full flex items-center justify-between gap-4">
        <div
          className="w-[180px] flex items-center justify-center h-10 bg-purple-400 text-center text-white rounded mt-8 cursor-pointer hover:bg-fuchsia-500 transition-colors"
          onClick={() => prevButton()}
        >
          Prev
        </div>
        <div
          className="w-[180px] flex items-center justify-center h-10 bg-purple-400 text-center text-white rounded mt-8 cursor-pointer hover:bg-fuchsia-500 transition-colors"
          onClick={() => handleCourseCreate()}
        >
          {isEdit ? "Update" : "Create"}
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
