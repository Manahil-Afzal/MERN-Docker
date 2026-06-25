"use client";

import { styles } from "@/app/styles/style";
import React, { FC, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import { BsLink45Deg, BsPencil } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import toast from "react-hot-toast";

/* ---------------- TYPES ---------------- */

interface Link {
  title: string;
  url: string;
}

/* IMPORTANT:
   renamed to avoid conflict with parent CourseContentItem */
interface CourseContentItemUI {
  videoUrl: string;
  title: string;
  description: string;
  videoSection: string;
  videoLength?: string;
  links: Link[];
  suggestion: string;
}

/* ---------------- PROPS ---------------- */

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseContentData: CourseContentItemUI[];
  setCourseContentData: React.Dispatch<
    React.SetStateAction<CourseContentItemUI[]>
  >;
  handleSubmit: () => void;
};

/* ---------------- COMPONENT ---------------- */

const CourseContent: FC<Props> = ({
  courseContentData,
  setCourseContentData,
  active,
  setActive,
  handleSubmit: handleCourseSubmit,
}) => {
  const safeCourseContentData = Array.isArray(courseContentData)
    ? courseContentData
    : [];

  const safeLinks = (
    item: Partial<CourseContentItemUI> | null | undefined
  ): Link[] =>
    Array.isArray(item?.links) && item.links.length > 0
      ? item.links
      : [{ title: "", url: "" }];

  const getLastContentItem = () =>
    safeCourseContentData.length > 0
      ? safeCourseContentData[safeCourseContentData.length - 1]
      : null;

  const [isCollapsed, setIsCollapsed] = useState<boolean[]>(
    Array(safeCourseContentData.length).fill(false)
  );

  const handleCollapseToggle = (index: number) => {
    const updated = [...isCollapsed];
    updated[index] = !updated[index];
    setIsCollapsed(updated);
  };

  const handleRemoveLink = (index: number, linkIndex: number) => {
    const updated = [...safeCourseContentData];
    updated[index].links = safeLinks(updated[index]);
    updated[index].links.splice(linkIndex, 1);
    setCourseContentData(updated);
  };

  const handleAddLink = (index: number) => {
    const updated = [...safeCourseContentData];
    updated[index].links = safeLinks(updated[index]);
    updated[index].links.push({ title: "", url: "" });
    setCourseContentData(updated);
  };

  const newContentHandler = (item: CourseContentItemUI) => {
    const itemLinks = safeLinks(item);

    if (
      item.title === "" ||
      item.description === "" ||
      item.videoUrl === "" ||
      itemLinks[0].title === "" ||
      itemLinks[0].url === ""
    ) {
      toast.error("Please fill all the fields!");
      return;
    }

    const lastSection =
      safeCourseContentData.length > 0
        ? safeCourseContentData[safeCourseContentData.length - 1].videoSection
        : "Untitled Section";

    const newContent: CourseContentItemUI = {
      videoUrl: "",
      title: "",
      description: "",
      videoSection: lastSection,
      videoLength: "",
      links: [{ title: "", url: "" }],
      suggestion: "",
    };

    setCourseContentData([...safeCourseContentData, newContent]);
  };

  const [activeSection, setActiveSection] = useState(1);

  const addNewSection = () => {
    const lastItem = getLastContentItem();

    if (!lastItem) {
      toast.error("Please add content first");
      return;
    }

    const lastLinks = safeLinks(lastItem);

    if (
      lastItem.title === "" ||
      lastItem.description === "" ||
      lastItem.videoUrl === "" ||
      lastLinks[0].title === "" ||
      lastLinks[0].url === ""
    ) {
      toast.error("Please fill all the fields!");
      return;
    }

    setActiveSection((prev) => prev + 1);

    const newContent: CourseContentItemUI = {
      videoUrl: "",
      title: "",
      description: "",
      videoSection: `Untitled Section ${activeSection}`,
      videoLength: "",
      links: [{ title: "", url: "" }],
      suggestion: "",
    };

    setCourseContentData([...safeCourseContentData, newContent]);
  };

  const prevButton = () => {
    setActive(active - 1);
  };

  const handleOptions = () => {
    const lastItem = getLastContentItem();

    if (!lastItem) {
      toast.error("Please add content first");
      return;
    }

    const lastLinks = safeLinks(lastItem);

    if (
      lastItem.title === "" ||
      lastItem.description === "" ||
      lastItem.videoUrl === "" ||
      lastLinks[0].title === "" ||
      lastLinks[0].url === ""
    ) {
      toast.error("Section can't be empty");
      return;
    }

    setActive(active + 1);
    handleCourseSubmit();
  };

  return (
    <div className="w-[80%] m-auto mt-24 p-3">
      <form onSubmit={(e) => e.preventDefault()}>
        {safeCourseContentData.map((item, index) => {
          const showSectionInput =
            index === 0 ||
            item.videoSection !== safeCourseContentData[index - 1]?.videoSection;

          return (
            <div
              key={index}
              className={`w-full bg-[#cdc8c817] p-4 ${showSectionInput ? "mt-10" : "mb-0"
                }`}
            >
              {showSectionInput && (
                <>
                  <div className="flex w-full items-center">
                    <input
                      type="text"
                      className={`text-[20px] ${item.videoSection === "Untitled Section"
                          ? "w-[170px]"
                          : "w-min"
                        } font-Poppins cursor-pointer dark:text-white text-black bg-transparent outline-none`}
                      value={item.videoSection}
                      onChange={(e) => {
                        const updated = [...safeCourseContentData];
                        updated[index].videoSection = e.target.value;
                        setCourseContentData(updated);
                      }}
                    />
                    <BsPencil className="cursor-pointer" />
                  </div>
                  <br />
                </>
              )}

              <div className="flex justify-between items-center">
                <div>
                  {isCollapsed[index] && item.title ? (
                    <p>
                      {index + 1}. {item.title}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center">
                  <AiOutlineDelete
                    className="cursor-pointer"
                    onClick={() => {
                      if (index > 0) {
                        const updated = [...safeCourseContentData];
                        updated.splice(index, 1);
                        setCourseContentData(updated);
                      }
                    }}
                  />

                  <MdOutlineKeyboardArrowDown
                    className="cursor-pointer"
                    onClick={() => handleCollapseToggle(index)}
                  />
                </div>
              </div>

              {!isCollapsed[index] && (
                <>
                  <input
                    className={styles.input}
                    placeholder="Video Title"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...safeCourseContentData];
                      updated[index].title = e.target.value;
                      setCourseContentData(updated);
                    }}
                  />

                  <input
                    className={styles.input}
                    placeholder="Video URL"
                    value={item.videoUrl}
                    onChange={(e) => {
                      const updated = [...safeCourseContentData];
                      updated[index].videoUrl = e.target.value;
                      setCourseContentData(updated);
                    }}
                  />

                  <textarea
                    className={styles.input}
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...safeCourseContentData];
                      updated[index].description = e.target.value;
                      setCourseContentData(updated);
                    }}
                  />

                  {safeLinks(item).map((link, linkIndex) => (
                    <div key={linkIndex}>
                      <input
                        className={styles.input}
                        value={link.title}
                        placeholder="Link Title"
                        onChange={(e) => {
                          const updated = [...safeCourseContentData];
                          updated[index].links[linkIndex].title =
                            e.target.value;
                          setCourseContentData(updated);
                        }}
                      />

                      <input
                        className={styles.input}
                        value={link.url}
                        placeholder="Link URL"
                        onChange={(e) => {
                          const updated = [...safeCourseContentData];
                          updated[index].links[linkIndex].url = e.target.value;
                          setCourseContentData(updated);
                        }}
                      />
                    </div>
                  ))}

                  <p onClick={() => handleAddLink(index)}>
                    <BsLink45Deg /> Add Link
                  </p>
                </>
              )}

              {index === safeCourseContentData.length - 1 && (
                <p onClick={() => newContentHandler(item)}>
                  <AiOutlinePlusCircle /> Add new Content
                </p>
              )}
            </div>
          );
        })}

        <p onClick={addNewSection}>
          <AiOutlinePlusCircle /> Add Section
        </p>
      </form>

      <div className="flex justify-between mt-10">
        <button onClick={prevButton}>Prev</button>
        <button onClick={handleOptions}>Next</button>
      </div>
    </div>
  );
};

export default CourseContent;