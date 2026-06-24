"use client";

import { styles } from "@/app/styles/style";
import { useGetHeroDataQuery } from "@/redux/features/layout/layoutApi";
import React, { FC, useEffect, useState, Dispatch, SetStateAction } from "react";

/* ---------------- TYPES ---------------- */

import { CourseInfo } from "@/types/course";

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

/* ---------------- COMPONENT ---------------- */

const CourseInformation: FC<Props> = ({
  courseInfo,
  setCourseInfo,
  active,
  setActive,
}) => {
  const [dragging, setDragging] = useState(false);
  const { data } = useGetHeroDataQuery("Categories", {});
  const [categories, setCategories] = useState<Category[]>([]);

  /* ---------------- LOAD CATEGORIES ---------------- */

  useEffect(() => {
    if (data) {
      setCategories(data.layout.categories);
    }
  }, [data]);

  const hasCategoryOptions = categories.length > 0;

  /* ---------------- FORM SUBMIT ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActive(active + 1);
  };

  /* ---------------- FILE UPLOAD ---------------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCourseInfo((prev) => ({
          ...prev,
          thumbnail: reader.result,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  /* ---------------- DRAG EVENTS ---------------- */

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
        setCourseInfo((prev) => ({
          ...prev,
          thumbnail: reader.result,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-[80%] m-auto mt-40">
      <form onSubmit={handleSubmit} className={styles.label}>

        {/* COURSE NAME */}
        <label>Course Name</label>
        <input
          type="text"
          required
          value={courseInfo.name}
          onChange={(e) =>
            setCourseInfo({ ...courseInfo, name: e.target.value })
          }
          className={styles.input}
        />

        {/* DESCRIPTION */}
        <div className="mb-5 mt-8">
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
            className={`${styles.input} h-min! py-2!`}
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
                setCourseInfo({ ...courseInfo, price: e.target.value })
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
        <div className="w-full flex justify-between mt-5">
          <div className="w-[45%]">
            <label className={styles.label}>Tags</label>
            <input
              type="text"
              required
              value={courseInfo.tags}
              onChange={(e) =>
                setCourseInfo({ ...courseInfo, tags: e.target.value })
              }
              className={styles.input}
            />
          </div>

          <div className="w-[50%]">
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

        {/* LEVEL + DEMO */}
        <div className="w-full flex justify-between mt-5">
          <div className="w-[45%]">
            <label className={styles.label}>Level</label>
            <input
              type="text"
              required
              value={courseInfo.level}
              onChange={(e) =>
                setCourseInfo({ ...courseInfo, level: e.target.value })
              }
              className={styles.input}
            />
          </div>

          <div className="w-[50%]">
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

        {/* UPLOAD */}
        <input
          type="file"
          accept="image/*"
          id="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <label
          htmlFor="file"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full min-h-[10vh] border flex items-center justify-center p-6 ${
            dragging ? "bg-purple-300" : "bg-transparent"
          }`}
        >
          {courseInfo.thumbnail ? (
            <img
              src={courseInfo.thumbnail}
              alt="thumbnail"
              className="max-h-[200px] w-full object-cover"
            />
          ) : (
            <span>Drag & Drop or Click to Upload Thumbnail</span>
          )}
        </label>

        {/* NEXT BUTTON */}
        <div className="flex justify-end mt-5">
          <input
            type="submit"
            value="Next"
            className="w-[140px] h-10 bg-purple-400 text-white rounded cursor-pointer"
          />
        </div>
      </form>
    </div>
  );
};

export default CourseInformation;