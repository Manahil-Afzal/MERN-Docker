/* eslint-disable @next/next/no-img-element */
"use client";

import { styles } from "@/app/styles/style";
import { useGetHeroDataQuery } from "@/redux/features/layout/layoutApi";
import React, { FC, useState, Dispatch, SetStateAction } from "react";
import { CourseInfo } from "./CreateCourse";

interface Category {
  _id: string;
  title: string;
}

type Props = {
  courseInfo: CourseInfo;
  setCourseInfo: Dispatch<SetStateAction<CourseInfo>>;
  active: number;
  setActive: (active: number) => void;
};

const CourseInformation: FC<Props> = ({
  courseInfo,
  setCourseInfo,
  active,
  setActive,
}) => {
  const [dragging, setDragging] = useState(false);

  const { data } = useGetHeroDataQuery("Categories", {});
  const categories: Category[] = data?.layout?.categories ?? [];

  const hasCategoryOptions = categories.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActive(active + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        const image = reader.result as string;

        setCourseInfo((prev) => ({
          ...prev,
          thumbnail: image,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        const image = reader.result as string;

        setCourseInfo((prev) => ({
          ...prev,
          thumbnail: image,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-[80%] m-auto mt-40">
      <form onSubmit={handleSubmit}>
        {/* COURSE NAME */}
        <div className="mb-5">
          <label className={styles.label}>Course Name</label>
          <input
            type="text"
            required
            value={courseInfo.name}
            onChange={(e) =>
              setCourseInfo({
                ...courseInfo,
                name: e.target.value,
              })
            }
            className={styles.input}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-5">
          <label className={styles.label}>Course Description</label>
          <textarea
            rows={8}
            required
            value={courseInfo.description}
            onChange={(e) =>
              setCourseInfo({
                ...courseInfo,
                description: e.target.value,
              })
            }
            className={`${styles.input} h-min py-2`}
          />
        </div>

        {/* PRICE */}
        <div className="w-full flex flex-wrap gap-6 justify-between">
          <div className="w-full md:w-[48%]">
            <label className={styles.label}>Course Price</label>
            <input
              type="number"
              required
              value={courseInfo.price}
              onChange={(e) =>
                setCourseInfo({
                  ...courseInfo,
                  price: e.target.value,
                })
              }
              className={styles.input}
            />
          </div>

          <div className="w-full md:w-[48%]">
            <label className={styles.label}>Estimated Price</label>
            <input
              type="number"
              value={courseInfo.estimatedPrice}
              onChange={(e) =>
                setCourseInfo({
                  ...courseInfo,
                  estimatedPrice: e.target.value,
                })
              }
              className={styles.input}
            />
          </div>
        </div>

        {/* TAGS + CATEGORY */}
        <div className="w-full flex flex-wrap justify-between mt-5 gap-4">
          <div className="w-full md:w-[45%]">
            <label className={styles.label}>Tags</label>
            <input
              type="text"
              required
              value={courseInfo.tags}
              onChange={(e) =>
                setCourseInfo({
                  ...courseInfo,
                  tags: e.target.value,
                })
              }
              className={styles.input}
            />
          </div>

          <div className="w-full md:w-[50%]">
            <label className={styles.label}>Category</label>

            {hasCategoryOptions ? (
              <select
                required
                value={courseInfo.categories}
                onChange={(e) =>
                  setCourseInfo({
                    ...courseInfo,
                    categories: e.target.value,
                  })
                }
                className={styles.input}
              >
                <option value="">Select Category</option>

                {categories.map((item) => (
                  <option key={item._id} value={item.title}>
                    {item.title}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={courseInfo.categories}
                onChange={(e) =>
                  setCourseInfo({
                    ...courseInfo,
                    categories: e.target.value,
                  })
                }
                className={styles.input}
                placeholder="Enter category"
              />
            )}
          </div>
        </div>

        {/* LEVEL + DEMO URL */}
        <div className="w-full flex flex-wrap justify-between mt-5 gap-4">
          <div className="w-full md:w-[45%]">
            <label className={styles.label}>Level</label>
            <input
              type="text"
              required
              value={courseInfo.level}
              onChange={(e) =>
                setCourseInfo({
                  ...courseInfo,
                  level: e.target.value,
                })
              }
              className={styles.input}
            />
          </div>

          <div className="w-full md:w-[50%]">
            <label className={styles.label}>Demo URL</label>
            <input
              type="text"
              required
              value={courseInfo.demoUrl}
              onChange={(e) =>
                setCourseInfo({
                  ...courseInfo,
                  demoUrl: e.target.value,
                })
              }
              className={styles.input}
            />
          </div>
        </div>

        {/* FILE INPUT */}
        <input
          type="file"
          id="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* THUMBNAIL */}
        <div className="mt-5">
          <label
            htmlFor="file"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full min-h-[200px] border-2 border-dashed rounded flex items-center justify-center cursor-pointer p-4 ${dragging ? "bg-purple-200" : ""
              }`}
          >
            {courseInfo.thumbnail ? (
              <img
                src={courseInfo.thumbnail}
                alt="Course Thumbnail"
                className="w-full max-h-[300px] object-cover rounded"
              />
            ) : (
              <span className="text-center">
                Drag & Drop Thumbnail Here or Click to Upload
              </span>
            )}
          </label>
        </div>

        {/* NEXT BUTTON */}
        <div className="w-full flex justify-end mt-8">
          <input
            type="submit"
            value="Next"
            className="w-[140px] h-[40px] bg-[#37a39a] text-white rounded cursor-pointer"
          />
        </div>
      </form>
    </div>
  );
};

export default CourseInformation;