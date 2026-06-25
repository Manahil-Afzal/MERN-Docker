"use client";

import React, { FC, useEffect, useState } from "react";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CourseContent from "./CourseContent";
import CoursePreview from "./CoursePreview";

import {
  useEditCourseMutation,
  useGetAllCoursesQuery,
} from "../../../../redux/features/courses/coursesApi";

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ---------------- TYPES ---------------- */

type Props = {
  id: string;
};

type ApiError = {
  data?: {
    message?: string;
  };
};

type CourseContentItem = {
  videoUrl: string;
  title: string;
  description: string;
  videoSection: string;
  videoLength?: string;
  links: { title: string; url: string }[];
  suggestion: string;
};

type CourseItem = {
  _id: string;
  name: string;
  description: string;
  price: string | number;
  estimatedPrice?: string | number;
  tags: string;
  level: string;
  categories: string;
  demoUrl: string;
  thumbnail?: { url: string };
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  courseData: CourseContentItem[];
};

type CoursesResponse = {
  courses?: CourseItem[];
};

type CourseInfoState = {
  name: string;
  description: string;
  price: string | number;
  estimatedPrice: string | number;
  tags: string;
  level: string;
  categories: string;
  demoUrl: string;
  thumbnail: string;
};

/* ---------------- COMPONENT ---------------- */

const EditCourse: FC<Props> = ({ id }) => {
  const router = useRouter();

  const [editCourse, { isSuccess, error }] = useEditCourseMutation();

  const { data, isLoading } = useGetAllCoursesQuery(
    {},
    { refetchOnMountOrArgChange: true }
  ) as { data?: CoursesResponse; isLoading: boolean };

  const selectedCourseId = String(id || "");

  const [active, setActive] = useState(0);

  const [courseInfo, setCourseInfo] = useState<CourseInfoState>({
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

  const [benefits, setBenefits] = useState<{ title: string }[]>([
    { title: "" },
  ]);

  const [prerequisites, setPrerequisites] = useState<{ title: string }[]>([
    { title: "" },
  ]);

  const [courseContentData, setCourseContentData] = useState<
    CourseContentItem[]
  >([
    {
      videoUrl: "",
      title: "",
      description: "",
      videoSection: "Untitled Section",
      videoLength: "",
      links: [{ title: "", url: "" }],
      suggestion: "",
    },
  ]);

  const [courseData, setCourseData] = useState<Record<string, unknown>>({});

  const editCourseData = data?.courses?.find(
    (item) => item._id === selectedCourseId
  );

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (isSuccess) {
      toast.success("Course Updated successfully");
      router.push("/admin/courses");
    }

    if (error && "data" in error) {
      const err = error as ApiError;
      toast.error(err.data?.message || "Failed to update course");
    }
  }, [isSuccess, error, router]);

  useEffect(() => {
    if (!editCourseData) return;

    setCourseInfo({
      name: editCourseData.name,
      description: editCourseData.description,
      price: editCourseData.price,
      estimatedPrice: editCourseData.estimatedPrice || "",
      tags: editCourseData.tags,
      level: editCourseData.level,
      categories: editCourseData.categories || "",
      demoUrl: editCourseData.demoUrl,
      thumbnail: editCourseData.thumbnail?.url || "",
    });

    setBenefits(
      Array.isArray(editCourseData.benefits) &&
        editCourseData.benefits.length > 0
        ? editCourseData.benefits
        : [{ title: "" }]
    );

    setPrerequisites(
      Array.isArray(editCourseData.prerequisites) &&
        editCourseData.prerequisites.length > 0
        ? editCourseData.prerequisites
        : [{ title: "" }]
    );

    setCourseContentData(
      Array.isArray(editCourseData.courseData) &&
        editCourseData.courseData.length > 0
        ? (editCourseData.courseData as CourseContentItem[]).map(
          (item: CourseContentItem) => ({
            ...item,
            links:
              Array.isArray(item.links) && item.links.length > 0
                ? item.links
                : [{ title: "", url: "" }],
          })
        )
        : [
          {
            videoUrl: "",
            title: "",
            description: "",
            videoSection: "Untitled Section",
            videoLength: "",
            links: [{ title: "", url: "" }],
            suggestion: "",
          },
        ]
    );
  }, [editCourseData]);

  /* ---------------- HANDLERS ---------------- */

  const handleSubmit = () => {
    const payload = {
      name: courseInfo.name,
      description: courseInfo.description,
      categories: courseInfo.categories,
      price: courseInfo.price,
      estimatedPrice: courseInfo.estimatedPrice,
      tags: courseInfo.tags,
      thumbnail: courseInfo.thumbnail,
      level: courseInfo.level,
      demoUrl: courseInfo.demoUrl,
      benefits: benefits.map((b) => ({ title: b.title })),
      prerequisites: prerequisites.map((p) => ({ title: p.title })),
      courseData: courseContentData.map((c) => ({
        videoUrl: c.videoUrl,
        title: c.title,
        description: c.description,
        videoSection: c.videoSection,
        videoLength: c.videoLength,
        links: c.links.map((l) => ({
          title: l.title,
          url: l.url,
        })),
        suggestion: c.suggestion,
      })),
    };

    setCourseData(payload);
  };

  const handleCourseCreate = async () => {
    if (!editCourseData?._id) {
      toast.error("Course not found for editing");
      return;
    }

    await editCourse({
      id: editCourseData._id,
      data: courseData,
    });
  };

  /* ---------------- LOADING ---------------- */

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading course data...</div>
      </div>
    );
  }

  if (!editCourseData) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-xl">Course not found.</div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full flex min-h-screen">
      <div className="w-[80%]">
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
            isEdit={true}
          />
        )}
      </div>

      <div className="w-[20%] mt-[100px] h-screen fixed z-[-1] top-18 right-0">
        <CourseOptions active={active} setActive={setActive} />
      </div>
    </div>
  );
};

export default EditCourse;