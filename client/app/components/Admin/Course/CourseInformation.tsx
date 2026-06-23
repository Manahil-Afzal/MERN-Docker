import { styles } from "@/app/styles/style";
import { useGetHeroDataQuery } from "@/redux/features/layout/layoutApi";
import React, { FC, useEffect, useState } from "react";

interface CourseInfo {
  name: string;
  description: string;
  price: string | number;
  estimatedPrice?: string | number;
  tags: string;
  categories: string;
  level: string;
  demoUrl: string;
  thumbnail: string;
}

interface Category {
  _id: string;
  title: string;
}

type Props = {
  courseInfo: CourseInfo;
  setCourseInfo: (courseInfo: CourseInfo) => void;
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
  const {data} = useGetHeroDataQuery("Categories", {});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() =>{
     if(data){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategories(data.layout.categories);
     }
  },[data])

    const hasCategoryOptions = categories.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActive(active + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setCourseInfo({ ...courseInfo, thumbnail: reader.result });
        }
      };

      reader.readAsDataURL(file);
    }
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

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCourseInfo({ ...courseInfo, thumbnail: reader.result });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-[80%] m-auto mt-40">
      <form onSubmit={handleSubmit} className={`${styles.label}`}>
        <div>
          <label htmlFor="">Course Name</label>
          <input
            type="name"
            name=""
            required
            value={courseInfo.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCourseInfo({ ...courseInfo, name: e.target.value })
            }
            id="name"
            placeholder="MERN Stack LMS Plateform with next 13"
            className={`${styles.input}`}
          />
          <br />

          <div className="mb-5 mt-8">
            <label className={`${styles.label}`}>Course Description</label>
            <textarea
              name=""
              id=""
              cols={30}
              rows={8}
              placeholder="Write something amazing....."
              className={`${styles.input} h-min! py-2!`}
              value={courseInfo.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCourseInfo({ ...courseInfo, description: e.target.value })
              }
            ></textarea>
          </div>
          <br />

          <div className="w-full flex flex-wrap gap-6 justify-between">
            <div className="w-full md:w-[48%]">
              <label className={`${styles.label}`}>Course Prize</label>
              <input
                type="number"
                name=""
                required
                value={courseInfo.price}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCourseInfo({ ...courseInfo, price: e.target.value })
                }
                id="price"
                placeholder="29"
                className={`${styles.input}`}
              />
            </div>

            <div className="w-full md:w-[48%]">
              <label className={styles.label}>Estimated Price (Optional)</label>
              <input
                type="number"
                name=""
                value={courseInfo.estimatedPrice}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCourseInfo({
                    ...courseInfo,
                    estimatedPrice: e.target.value,
                  })
                }
                id="estimated-price"
                placeholder="60"
                className={`${styles.input}`}
              />
            </div>
          </div>
          <br />
          <div className="w-full flex justify-between">
            <div className="w-[45%]">
              <label className="text-black dark:text-white" htmlFor="email">
              Course Tags
            </label>
            <input
              type="text"
              required
              name=""
              value={courseInfo.tags}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCourseInfo({ ...courseInfo, tags: e.target.value })
              }
              id="tags"
              placeholder="MERN, Next 13, Socket io, tailwind css, LMS"
              className={`${styles.input} placeholder:text-black/50 dark:placeholder:text-white/50`}
            />
            </div>
            <div className="w-[50%]">
              <label className={`${styles.label} w-[50%]`}>Course Categories</label>
              {hasCategoryOptions ? (
                <select
                  name="categories"
                  id="categories"
                  required
                  className={`${styles.input} bg-white dark:bg-[#1f1f1f] text-black dark:text-white`}
                  value={courseInfo.categories || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCourseInfo({ ...courseInfo, categories: e.target.value })
                  }
                >
                  <option value="" className="bg-white dark:bg-[#1f1f1f] text-black dark:text-white">
                    Select Category
                  </option>
                   {categories.map((item: Category) => (
                    <option
                      value={item.title}
                      key={item._id}
                      className="bg-white dark:bg-[#1f1f1f] text-black dark:text-white"
                    >
                      {item.title}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  name="categories"
                  id="categories"
                  placeholder="e.g. Web Development"
                  className={`${styles.input} bg-white dark:bg-[#1f1f1f] text-black dark:text-white`}
                  value={courseInfo.categories || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCourseInfo({ ...courseInfo, categories: e.target.value })
                  }
                />
              )}
              {!hasCategoryOptions && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No saved categories found yet. Enter one manually for this first course.
                </p>
              )}
            </div>
          </div>
          <br />

          <div className="w-full flex justify-between">
            <div className="w-[45%]">
              <label className={`${styles.label}`}> Course Level</label>
              <input
                type="text"
                name=""
                value={courseInfo.level}
                required
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCourseInfo({ ...courseInfo, level: e.target.value })
                }
                id="level"
                placeholder="Beginner/Intermediate/Expert"
                className={`${styles.input}`}
              />
            </div>
            <div className="w-[50%]">
              <label className={`${styles.label} w-[50%]`}>Demo Url</label>
              <input
                type="text"
                name=""
                required
                value={courseInfo.demoUrl}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCourseInfo({ ...courseInfo, demoUrl: e.target.value })
                }
                id="demoUrl"
                placeholder="eer74fd"
                className={`${styles.input}`}
              />
            </div>
          </div>
          <br />
          <div className="w-full">
            <input
              type="file"
              accept="image/*"
              id="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <label
              htmlFor="file"
              className={`w-full min-h-[10vh] dark:border-white border-[#00000026] p-6 border flex items-center justify-center ${
                dragging ? "bg-purple-400" : "bg-transparent"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {courseInfo.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={courseInfo.thumbnail}
                  alt=""
                  className="max-h-full w-full object-cover"
                />
              ) : (
                <span className="text-black dark:text-white ">
                  Drag and drop your thumbnail here or click to browser
                </span>
              )}
            </label>
          </div>
          <br />

          <div className="w-full flex items-center justify-end">
             <input 
                  type="submit" 
                  value="Next"              
                  className="w-[140px] h-10 bg-purple-400 hover:bg-purple-400 text-center text-white rounded mt-8 cursor-pointer transition-colors"
                  />
          </div>
          <br />
          <br />
        </div>
      </form>
    </div>
  );
};

export default CourseInformation;
