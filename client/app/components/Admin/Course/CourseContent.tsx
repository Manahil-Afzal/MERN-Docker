import { styles } from "@/app/styles/style";
import React, { FC, useState } from "react";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { BsLink45Deg, BsPencil } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import toast from "react-hot-toast";

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
}

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseContentData: CourseContentItem[];
  setCourseContentData: (courseContentData: CourseContentItem[]) => void;
  handleSubmit: () => void;
};

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

  const safeLinks = (item: Partial<CourseContentItem> | null | undefined) =>
    Array.isArray(item?.links) && item.links.length > 0
      ? item.links
      : [{ title: "", url: "" }];

  const getLastContentItem = () =>
    safeCourseContentData.length > 0
      ? safeCourseContentData[safeCourseContentData.length - 1]
      : null;

  const [isCollapsed, setIsCollapsed] = useState(
    Array(safeCourseContentData.length).fill(false)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCollapseToggle = (index: number) => {
    const updatedCollapsed = [...isCollapsed];
    updatedCollapsed[index] = !updatedCollapsed[index];
    setIsCollapsed(updatedCollapsed);
  };

  const handleRemoveLink = (index: number, linkIndex: number) => {
    const updatedData = [...safeCourseContentData];
    updatedData[index].links = safeLinks(updatedData[index]);
    updatedData[index].links.splice(linkIndex, 1);
    setCourseContentData(updatedData);
  };

  const handleAddLink =(index:number) => {
      const updatedData = [...safeCourseContentData];
      updatedData[index].links = safeLinks(updatedData[index]);
      updatedData[index].links.push({title: "", url: ""});
      setCourseContentData(updatedData);
  };

  const newContentHandler = (item: CourseContentItem) => {
    const itemLinks = safeLinks(item);
    if(item.title === "" || item.description === "" || item.videoUrl === "" || itemLinks[0].title === "" || itemLinks[0].url === ""){
        toast.error("Please fill all the fields!");
    } 
    else {
        let newVideoSection = "";

      if(safeCourseContentData.length > 0) {
        const lastVideoSection = safeCourseContentData[safeCourseContentData.length - 1].videoSection;

            if(lastVideoSection){
                newVideoSection = lastVideoSection;
            }
        }

        const newContent ={
            videoUrl: "",
            title: "",
            description: "",
            videoSection: newVideoSection,
            links: [{title:"", url: ""}],
        };

    setCourseContentData([...safeCourseContentData, newContent]);
    };
  };
     const [activeSection, setActiveSection] = useState(1);

       const addNewSection = () => {
        const lastItem = getLastContentItem();
        const lastItemLinks = safeLinks(lastItem);
        if (!lastItem) {
            toast.error("Please add content first");
            return;
        }
        if(
            lastItem.title === "" ||
            lastItem.description === "" ||
            lastItem.videoUrl === "" ||
            lastItemLinks[0].title === "" ||
            lastItemLinks[0].url === ""
        ) {
            toast.error("Please fill all the fields!");
        } else{
            setActiveSection(activeSection + 1);
            const newContent ={
            videoUrl: "",
            title: "",
            description: "",
            videoSection: `untitled Section ${activeSection}`, 
            links: [{title:"", url: ""}],
        };
            setCourseContentData([...safeCourseContentData, newContent]);
        }
       };

       const prevButton =() => {
         setActive(active - 1);
       };

       const handleOptions =() =>{
        const lastItem = getLastContentItem();
        const lastItemLinks = safeLinks(lastItem);
        if (!lastItem) {
          toast.error("Please add content first");
          return;
        }
        if(
          lastItem.title === "" ||
          lastItem.description === "" ||
          lastItem.videoUrl === "" ||
          lastItemLinks[0].title === "" ||
          lastItemLinks[0].url === ""
        ) {
            toast.error("section can't be empty")
        } else{
            setActive(active + 1);
            handleCourseSubmit();
        }
       }

  return (
    <div className="w-[80%] m-auto mt-24 p-3">
      <form onSubmit={handleSubmit}>
        {safeCourseContentData.map((item: CourseContentItem, index: number) => {
          const showSectionInput =
            index === 0 ||
            item.videoSection !== safeCourseContentData[index - 1].videoSection;

          return (
            <div
              key={index}
              className={`w-full bg-[#cdc8c817] p-4 ${
                showSectionInput ? "mt-10" : "mb-0"
              }`}
            >
              {showSectionInput && (
                <>
                  <div className="flex w-full items-center">
                    <input
                      type="text"
                      className={`text-[20px] ${
                        item.videoSection === "Untitled Section"
                          ? "w-[170px]"
                          : "w-min"
                      } font-Poppins cursor-pointer dark:text-white text-black bg-transparent outline-none`}
                      value={item.videoSection}
                      onChange={(e) => {
                        const updatedData = [...safeCourseContentData];
                        updatedData[index].videoSection = e.target.value;
                        setCourseContentData(updatedData);
                      }}
                    />
                    <BsPencil className="cursor-pointer dark:text-white text-black" />
                  </div>
                  <br />
                </>
              )}

              <div className="flex w-full items-center justify-between my-0">
                {isCollapsed[index] ? (
                  item.title ? (
                    <p className="font-Poppins dark:text-white text-black">
                      {index + 1}. {item.title}
                    </p>
                  ) : null
                ) : (
                  <div></div>
                )}

                <div className="flex items-center">
                  <AiOutlineDelete
                    className={`dark:text-white text-[20px] mr-2 text-black ${
                      index > 0 ? "cursor-pointer" : "cursor-no-drop"
                    }`}
                    onClick={() => {
                      if (index > 0) {
                        const updatedData = [...safeCourseContentData];
                        updatedData.splice(index, 1);
                        setCourseContentData(updatedData);
                      }
                    }}
                  />
                  <MdOutlineKeyboardArrowDown
                    fontSize="large"
                    className="dark:text-white text-black cursor-pointer"
                    style={{
                      transform: isCollapsed[index]
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                    onClick={() => handleCollapseToggle(index)}
                  />
                </div>
              </div>

              {!isCollapsed[index] && (
                <>
                  <div className="my-3">
                    <label className={styles.label}>Video Title</label>
                    <input
                      type="text"
                      placeholder="Project Plan..."
                      className={styles.input}
                      value={item.title}
                      onChange={(e) => {
                        const updatedData = [...safeCourseContentData];
                        updatedData[index].title = e.target.value;
                        setCourseContentData(updatedData);
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className={styles.label}>Video Url</label>
                    <input
                      type="text"
                      placeholder="Enter video URL..."
                      className={styles.input}
                      value={item.videoUrl}
                      onChange={(e) => {
                        const updatedData = [...safeCourseContentData];
                        updatedData[index].videoUrl = e.target.value;
                        setCourseContentData(updatedData);
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className={styles.label}>Video Description</label>
                    <textarea
                      rows={8}
                      cols={30}
                      placeholder="Enter video description..."
                      className={`${styles.input} h-min! py-2`}
                      value={item.description}
                      onChange={(e) => {
                        const updatedData = [...safeCourseContentData];
                        updatedData[index].description = e.target.value;
                        setCourseContentData(updatedData);
                      }}
                    />
                    <br />
                  </div>

                  {safeLinks(item).map((link: Link, linkIndex: number) => (
                    <div className="mb-3 block" key={linkIndex}>
                      <div className="w-full flex items-center justify-between">
                        <label className={styles.label}>Link {linkIndex + 1}</label>
                        <AiOutlineDelete
                          className={`${
                            linkIndex === 0 ? "cursor-no-drop" : "cursor-pointer"
                          } text-black dark:text-white text-[20px]`}
                          onClick={() =>
                            linkIndex === 0 ? null : handleRemoveLink(index, linkIndex)
                          }
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Source Code... (Link Title)"
                        className={styles.input}
                        value={link.title}
                        onChange={(e) => {
                          const updatedData = [...safeCourseContentData];
                          updatedData[index].links = safeLinks(updatedData[index]);
                          updatedData[index].links[linkIndex].title = e.target.value;
                          setCourseContentData(updatedData);
                        }}
                      />
                      <input
                        type="url"
                        placeholder="Source Code... (Link URL)"
                        className={`${styles.input} mt-6`}
                        value={link.url}
                        onChange={(e) => {
                          const updatedData = [...safeCourseContentData];
                          updatedData[index].links = safeLinks(updatedData[index]);
                          updatedData[index].links[linkIndex].url = e.target.value;
                          setCourseContentData(updatedData);
                        }}
                      />
                    </div>
                  ))}
                  <br />
                  {/* add links button */}
                  <div className="inline-block mb-4">
                      <p className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                        onClick={() => handleAddLink(index)}
                      >
                        <BsLink45Deg className="mr-2" /> Add Link
                      </p>
                  </div>
                </>
              )}
              <br />
              {/* add new content */}
              {index === safeCourseContentData.length - 1 && (
                <div>
                    <p className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                     onClick={() => newContentHandler(item)}
                    >
                  <AiOutlinePlusCircle className="mr-2" /> 
                    Add new Content
                    </p>
                </div>
              )}
            </div>
          );
        })} 
        <br />

        <div className="flex items-center text-[20px] dark:text-white text-black cursor-pointer"
           onClick={() => addNewSection()}
        >
           <AiOutlinePlusCircle className="mr-2" /> Add new Section
        </div>
      </form>      
      <br />        
       <div className='w-full flex items-center justify-between gap-4'>
            <div className='w-[180px] flex items-center justify-center h-10 bg-purple-400 text-center text-white rounded mt-8 cursor-pointer hover:bg-fuchsia-500 transition-colors'
             onClick={() => prevButton()}
             >
                  Prev              
            </div>
            <div className='w-[180px] flex items-center justify-center h-10 bg-purple-400 text-center text-white rounded mt-8 cursor-pointer hover:bg-fuchsia-500 transition-colors'
                onClick={() => handleOptions()}
                >
                    Next
            </div>
        </div>
        <br />
        <br />
        <br />
    </div>
  );
};

export default CourseContent;