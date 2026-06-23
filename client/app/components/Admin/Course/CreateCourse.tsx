"use client";

import React, { useEffect, useState } from "react";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CourseContent from "./CourseContent";
import CoursePreview from "./CoursePreview";
import {
  useCreateCourseMutation,
  useEditCourseMutation,
  useGetSingleCourseQuery,
} from "@/redux/features/courses/coursesApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Link {
  title: string;
  url: string;
}

interface CourseContentItem {
  videoUrl: string;
  title: string;
  description: string;
  videoSection: string;
  links: Link[];
  suggestion?: string;
}

type Props = {
  isEdit?: boolean;
  courseId?: string;
};

const CreateCourse = ({ isEdit = false, courseId }: Props) => {
  const [createCourse, { isLoading: isCreating, isSuccess: createSuccess, error: createError }] =
    useCreateCourseMutation();

  const [editCourse, { isLoading: isUpdating, isSuccess: updateSuccess, error: updateError }] =
    useEditCourseMutation();

  const { isLoading: isFetchingCourse } =
    useGetSingleCourseQuery(courseId, {
      skip: !isEdit || !courseId,
    });

  const router = useRouter();

  const [active, setActive] = useState(0);

  const [courseInfo, setCourseInfo] = useState({
    name: "",
    description: "",
    price: "",
    estimatedPrice: "",
    tags: "",
    level: "",
    categories: "",
    demoUrl: "",
    thumbnail: "",
  });

  const [benefits, setBenefits] = useState([{ title: "" }]);
  const [prerequisites, setPrerequisites] = useState([{ title: "" }]);
  const [courseContentData, setCourseContentData] = useState<CourseContentItem[]>([]);
  const [courseData, setCourseData] = useState({});

  useEffect(() => {
    if (createSuccess) {
      toast.success("Course created Successfully");
      router.push("/admin/courses");
    }

    if (updateSuccess) {
      toast.success("Course updated Successfully");
      router.push("/admin/courses");
    }

    const error = createError || updateError;
    if (error && "data" in error) {
      toast.error((error as { data?: { message?: string } }).data?.message || "Something went wrong");
    }
  }, [createSuccess, updateSuccess, createError, updateError, router]);

  const handleSubmit = () => {
    setCourseData({ ...courseInfo, benefits, prerequisites, courseContentData });
  };

  const handleCourseCreate = async () => {
    const data = { ...courseInfo, benefits, prerequisites, courseContentData };

    if (!(isCreating || isUpdating)) {
      if (isEdit && courseId) {
        await editCourse({ id: courseId, data });
      } else {
        await createCourse(data);
      }
    }
  };

  if (isEdit && isFetchingCourse) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        Loading course data...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row min-h-screen overflow-x-hidden">

      {/* LEFT SIDE */}
      <div className="w-full lg:w-[80%] lg:pr-6">
        {active === 0 && (
          <CourseInformation
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
            active={active}
            setActive={setActive}
          />
        )}

        {active === 1 && (
          <CourseData
            benefits={benefits}
            setBenefits={setBenefits}
            prerequisites={prerequisites}
            setPrerequisites={setPrerequisites}
            active={active}
            setActive={setActive}
          />
        )}

        {active === 2 && (
          <CourseContent
            active={active}
            setActive={setActive}
            courseContentData={courseContentData}
            setCourseContentData={setCourseContentData}
            handleSubmit={handleSubmit}
          />
        )}

        {active === 3 && (
          <CoursePreview
            active={active}
            setActive={setActive}
            courseData={courseData}
            handleCourseCreate={handleCourseCreate}
            isEdit={isEdit}
          />
        )}
      </div>

      {/* RIGHT SIDE (UNCHANGED) */}
      <div
        className="
          w-full
          lg:w-[20%]
          lg:fixed
          lg:right-0
          lg:top-[100px]
          lg:h-screen
          z-10
          mt-10
          lg:mt-[100px]
        "
      >
        <CourseOptions active={active} setActive={setActive} />
      </div>

    </div>
  );
};

export default CreateCourse;