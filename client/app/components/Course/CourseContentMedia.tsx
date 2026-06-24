import { styles } from "@/app/styles/style";
import CoursePlayer from "@/app/utils/CoursePlayer";
import Ratings from "@/app/utils/Ratings";
import {
  useAddAnswerMutation,
  useAddQuestionMutation,
  useAddReplyMutation,
  useAddReviewMutation,
  useGetCourseDetailsQuery,
} from "@/redux/features/courses/coursesApi";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AiFillStar, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineStar } from "react-icons/ai";
import { BiMessage } from "react-icons/bi";
import { VscVerifiedFilled } from "react-icons/vsc";
import toast from "react-hot-toast";
import socketIO from "socket.io-client";

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:8000";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

type CourseLink = {
  url?: string;
  href?: string;
  link?: string;
  videoUrl?: string;
  title?: string;
};

type CourseLesson = {
  _id?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  videoPlayer?: string;
  questions?: unknown[];
  links?: CourseLink[];
};

type CourseUser = {
  _id: string;
  role?: string;
  avatar?: { url?: string };
  name?: string;
};

type Props = {
  data: CourseLesson[];
  id: string;
  activeVideo: number;
  setActiveVideo: (activeVideo: number) => void;
  user?: CourseUser;
  refetch?: () => void;
};

const format = (value?: string | Date) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getAvatarUrl = (person: { avatar?: { url?: string } } | undefined) =>
  person?.avatar?.url ??
  "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png";

const getLinkUrl = (link: unknown) => {
  const l = link as Record<string, unknown>;
  return String(l?.url || l?.href || l?.link || l?.videoUrl || "").trim();
};

const toExternalHref = (value: string) => {
  const url = value.trim();
  if (!url) {
    return "#";
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
    return url;
  }

  return `https://${url}`;
};

const isPlayableVideoLink = (value: string) => {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("youtube.com") ||
    normalized.includes("youtu.be") ||
    normalized.includes("vimeo.com") ||
    normalized.endsWith(".mp4") ||
    normalized.endsWith(".webm") ||
    normalized.endsWith(".ogg") ||
    normalized.endsWith(".m3u8") ||
    normalized.endsWith(".mov")
  );
};

const getMutationErrorMessage = (mutationError: unknown) => {
  if (!mutationError || typeof mutationError !== "object") {
    return "";
  }

  const err = mutationError as Record<string, unknown>;
  const data = err.data;
  if (data && typeof data === "object" && "message" in data) {
    return String((data as Record<string, unknown>).message || "");
  }

  if ("error" in err) {
    return String(err.error || "");
  }

  return "";
};


const CourseContentMedia = ({
  data,
  id,
  activeVideo,
  setActiveVideo,
  user,
  refetch,
}: Props) => {
  const [activeBar, setactiveBar] = useState(0);
  const [question, setQuestion] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(1);
  const [answer, setAnswer] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [reply, setReply] = useState("");
  const [reviewId, setReviewId] = useState("");
  const [isReviewReply, setIsReviewReply] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [selectedResourceUrl, setSelectedResourceUrl] = useState("");

  const [
    addNewQuestion,
    { isSuccess, error, isLoading: questionCreationLoading, reset: resetQuestionMutation },
  ] = useAddQuestionMutation();
  const { data: courseData, refetch: courseRefetch } = useGetCourseDetailsQuery(
    id,
    { refetchOnMountOrArgChange: true }
  );
  const [
    addAnswerInQuestion,
    {
      isSuccess: answerSuccess,
      error: answerError,
      isLoading: answerCreationLoading,
      reset: resetAnswerMutation,
    },
  ] = useAddAnswerMutation();
  const course = courseData?.course;
  const [
    addReviewInCourse,
    {
      isSuccess: reviewSuccess,
      error: reviewError,
      isLoading: reviewCreationLoading,
      reset: resetReviewMutation,
    },
  ] = useAddReviewMutation();

  const [
    addReplyInReview,
    {
      isSuccess: replySuccess,
      error: replyError,
      isLoading: replyCreationLoading,
      reset: resetReplyMutation,
    },
  ] = useAddReplyMutation();

  const handleQuestion = () => {
    if (question.length === 0) {
      toast.error("Question can't be empty");
    } else {
      addNewQuestion({
        question,
        courseId: id,
        contentId: data[activeVideo]._id,
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => { setQuestion(""); }, 0);
      refetch?.();
      toast.success("Question submitted successfully");
      socketId.emit("notification", {
        title: `New Question Received`,
        message: `You have a new question  reply in ${data[activeVideo].title}`,
        userId: user?._id,
      })
      resetQuestionMutation();
    }
    if (answerSuccess) {
      setTimeout(() => { setAnswer(""); }, 0);
      refetch?.();
      toast.success("Reply submitted successfully");
      if(user?.role !== "admin"){
         socketId.emit("notification", {
        title: `New Reply Received`,
        message: `Yi=ou have a new Reply in ${data[activeVideo].title}`,
        userId: user?._id,
      });
      }
      resetAnswerMutation();
    }
    if (error) {
      const message = getMutationErrorMessage(error);
      toast.error(message || "Failed to submit question");
      resetQuestionMutation();
    }
    if (answerError) {
      const message = getMutationErrorMessage(answerError);
      toast.error(message || "Failed to submit reply");
      resetAnswerMutation();
    }
    if (reviewSuccess) {
      setTimeout(() => { setReview(""); setRating(1); }, 0);
      courseRefetch();
      toast.success("Review submitted successfully");
      socketId.emit("notification", {
        title: `New Question Received`,
        message: `Yi=ou have a new question in ${data[activeVideo].title}`,
        userId: user?._id,
      })
      resetReviewMutation();
    }
    if (reviewError) {
      const message = getMutationErrorMessage(reviewError);
      toast.error(message || "Failed to submit review");
      resetReviewMutation();
    }
    if (replySuccess) {
      setTimeout(() => { setReply(""); }, 0);
      courseRefetch();
      toast.success("Reply added successfully");
      resetReplyMutation();
    }
    if (replyError) {
      const message = getMutationErrorMessage(replyError);
      toast.error(message || "Failed to submit reply");
      resetReplyMutation();
    }
  }, [
    isSuccess,
    error,
    answerSuccess,
    answerError,
    reviewSuccess,
    reviewError,
    replySuccess,
    replyError,
    refetch,
    courseRefetch,
    resetQuestionMutation,
    resetAnswerMutation,
    resetReviewMutation,
    resetReplyMutation,
    activeVideo,
    data,
    user,
  ]);

  const handleAnswerSubmit = () => {
    addAnswerInQuestion({
      answer,
      courseId: id,
      contentId: data[activeVideo]._id,
      questionId: questionId,
    });
  };

  const handleReviewSubmit = async () => {
    if (review.length === 0) {
      toast.error("Review can't be empty");
    } else {
      addReviewInCourse({ review, rating, courseId: id });
    }
  };

  const handleReviewReplySubmit = () => {
    if (!replyCreationLoading) {
      if (reply === "") {
        toast.error("Reply can't be empty");
      } else {
        addReplyInReview({ comment: reply, courseId: id, reviewId });
      }
    }
  };

  const totalLessons = Array.isArray(data) ? data.length : 0;
  const currentLesson = data?.[activeVideo];
  const resourceVideoLink = currentLesson?.links
    ?.map((link: CourseLink) => getLinkUrl(link))
    ?.find((url: string) => isPlayableVideoLink(url));
  const isPrevDisabled = totalLessons <= 0 || activeVideo <= 0;
  const isNextDisabled = totalLessons <= 0 || activeVideo >= totalLessons - 1;

  useEffect(() => {
    setTimeout(() => { setSelectedResourceUrl(""); }, 0);
  }, [activeVideo]);

  const goToPreviousLesson = () => {
    if (isPrevDisabled) {
      return;
    }
    setActiveVideo(activeVideo - 1);
  };

  const goToNextLesson = () => {
    if (isNextDisabled) {
      return;
    }
    setActiveVideo(activeVideo + 1);
  };

  const currentVideoId =
    selectedResourceUrl ||
    currentLesson?.videoUrl ||
    currentLesson?.videoPlayer ||
    resourceVideoLink ||
    course?.demoUrl ||
    "";

  return (
    <div className="w-[60%] 800px:w-[86%] py-4 m-auto">
      <CoursePlayer
        title={currentLesson?.title || "Lesson Video"}
        videoUrl={currentVideoId}
      />
      <div className="w-full flex items-center justify-between my-3">
        <button
          type="button"
          className={`${
            styles.button
          } bg-purple-400 text-white w-[unset]! min-h-10! py-[unset]! ${
            isPrevDisabled && "cursor-not-allowed! opacity-[.8]"
          }`}
          onClick={goToPreviousLesson}
          disabled={isPrevDisabled}
        >
          <AiOutlineArrowLeft className="mr-2" />
          Prev Course
        </button>
        <button
          type="button"
          className={`${
            styles.button
          } bg-purple-400 w-[unset]! text-white min-h-10! py-[unset]! ${
            isNextDisabled && "cursor-not-allowed! opacity-[.8]"
          }`}
          onClick={goToNextLesson}
          disabled={isNextDisabled}
        >
          Next Course
          <AiOutlineArrowRight className="ml-2" />
        </button>
      </div>
      <h1 className="pt-2 text-[25px] font-semibold dark:text-white text-black ">
        {currentLesson?.title}
      </h1>
      <br />
      <div className="w-full p-4 flex items-center justify-between bg-purple-400/10 backdrop-blur rounded shadow-inner border border-purple-400/20">
        {["Overview", "Resources", "Q&A", "Reviews"].map((text, index) => (
          <h5
            key={index}
            className={`800px:text-[20px] cursor-pointer ${
              activeBar === index
                ? "text-purple-400"
                : "dark:text-white text-black"
            }`}
            onClick={() => setactiveBar(index)}
          >
            {text}
          </h5>
        ))}
      </div>
      <br />
       {activeBar === 0 && (
        <>
          <p className="text-[18px] whitespace-pre-line mb-3 dark:text-white text-black">
            {data[activeVideo]?.description}
          </p>

          <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-purple-400/20 pt-8">
            <div>
              <h2 className="text-[22px] font-Poppins font-semibold text-black dark:text-white">
                Support Me
              </h2>
              <p className="text-[15px] mt-3 text-black dark:text-gray-300">
                LinkedIn:{" "}
                <a
                  href="https://www.linkedin.com/in/manahil-afzal/"
                  target="_blank"
                  className="text-purple-400 hover:text-purple-500 underline transition-colors"
                >
                  https://www.linkedin.com/in/manahil-afzal/
                </a>
              </p>
              <p className="text-[15px] mt-1 text-black dark:text-gray-300">
                GitHub:{" "}
                <a
                  href="https://github.com/Manahil-Afzal"
                  target="_blank"
                  className="text-purple-400 hover:text-purple-500 underline transition-colors"
                >
                  https://github.com/Manahil-Afzal
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-[22px] font-Poppins font-semibold text-black dark:text-white">
                Business Inquiries
              </h2>
              <p className="text-[15px] mt-3 text-black dark:text-gray-300">
                For collaborations or training:{" "}
                <a
                  href="mailto:info@yourdomain.com"
                  className="text-purple-400 hover:text-purple-500 underline transition-colors"
                >
                  info@zylolearn.com
                </a>
              </p>
              <p className="text-[14px] mt-1 text-black dark:text-gray-300 font-medium italic">
                #WebDev #Coding #Learning
              </p>
            </div>
          </div>
        </>
      )}

      {activeBar === 1 && (
        <div>
          {(data[activeVideo]?.links || []).map((item: CourseLink, index: number) => {
            const linkUrl = getLinkUrl(item);
            const isVideoResource = isPlayableVideoLink(linkUrl);
            const isSelectedVideo = selectedResourceUrl === linkUrl;

            return (
            <div className="mb-5" key={index}>
              <h2 className="800px:text-[20px] 800px:inline-block dark:text-white text-black">
                {item.title && item.title + " :"}
              </h2>
              {isVideoResource ? (
                <a
                  className={`inline-block 800px:text-[20px] 800px:pl-2 underline ${
                    isSelectedVideo
                      ? "text-purple-500"
                      : "text-purple-400 hover:text-purple-500"
                  }`}
                  href={toExternalHref(linkUrl)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSelectedResourceUrl(linkUrl)}
                >
                  {linkUrl}
                </a>
              ) : (
                <a
                  className="inline-block text-purple-400 800px:text-[20px] 800px:pl-2"
                  href={toExternalHref(linkUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {linkUrl}
                </a>
              )}
            </div>
            );
          })}
          {(data[activeVideo]?.links || []).length === 0 && (
            <p className="text-black dark:text-white">No resources for this lesson.</p>
          )}
        </div>
      )}
         {activeBar === 2 && (
        <>
          <div className="flex w-full">
            <Image
              src={getAvatarUrl(user)}
              width={50}
              height={50}
              alt=""
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
            <textarea
              name=""
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              id=""
              cols={40}
              rows={5}
              placeholder="Write your question..."
              className="outline-none bg-transparent ml-3 border dark:text-white text-black border-[#0000001d] dark:border-[#ffffff57] 800px:w-full p-2 rounded w-[90%] 800px:text-[18px] font-Poppins"
            ></textarea>
          </div>
          <div className="w-full flex justify-end">
            <div
              className={`${
                styles.button
              } w-[120px]! h-10! text-[18px] mt-5 bg-purple-400 hover:bg-purple-500 ${
                questionCreationLoading && "cursor-not-allowed"
              }`}
              onClick={questionCreationLoading ? () => {} : handleQuestion}
            >
              Submit
            </div>
          </div>
          <br />
          <br />
          <div className="w-full h-px bg-[#ffffff3b]"></div>
          <div>
            <CommentReply
              data={data}
              activeVideo={activeVideo}
              answer={answer}
              setAnswer={setAnswer}
              handleAnswerSubmit={handleAnswerSubmit}
              user={user}
              questionId={questionId}
              setQuestionId={setQuestionId}
              answerCreationLoading={answerCreationLoading}
            />
          </div>
        </>
      )}

      {activeBar === 3 && (
        <div className="w-full">
          <>
              <>
                <div className="flex w-full">
                  <Image
                    src={getAvatarUrl(user)}
                    width={50}
                    height={50}
                    alt=""
                    className="w-[50px] h-[50px] rounded-full object-cover"
                  />
                  <div className="w-full">
                    <h5 className="pl-3 text-[20px] font-medium dark:text-white text-black ">
                      Give a Rating <span className="text-purple-400">*</span>
                    </h5>
                    <div className="flex w-full ml-2 pb-3">
                      {[1, 2, 3, 4, 5].map((i) =>
                        rating >= i ? (
                          <AiFillStar
                            key={i}
                            className="mr-1 cursor-pointer"
                            color="rgb(246,186,0)"
                            size={25}
                            onClick={() => setRating(i)}
                          />
                        ) : (
                          <AiOutlineStar
                            key={i}
                            className="mr-1 cursor-pointer"
                            color="rgb(246,186,0)"
                            size={25}
                            onClick={() => setRating(i)}
                          />
                        )
                      )}
                    </div>
                    <textarea
                      name=""
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      id=""
                      cols={40}
                      rows={5}
                      placeholder="Write your comment..."
                      className="outline-none bg-transparent ml-3 border dark:text-white text-black border-[#0000001d] dark:border-[#ffffff57] 800px:w-full p-2 rounded w-[90%] 800px:text-[18px] font-Poppins"
                    ></textarea>
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  <div
                    className={`${
                      styles.button
                    } w-[120px]! h-10! text-[18px] mt-5 800px:mr-0 mr-2 bg-purple-400 hover:bg-purple-500 ${
                      reviewCreationLoading && "cursor-not-allowed"
                    }`}
                    onClick={
                      reviewCreationLoading ? () => {} : handleReviewSubmit
                    }
                  >
                    Submit
                  </div>
                </div>
              </>
            <br />
            <div className="w-full h-px bg-[#ffffff3b]"></div>
            <div className="w-full">
              <div className="w-full flex items-center mt-4">
                <span
                  className="800px:pl-4 text-[#000000b8] dark:text-[#ffffff83] cursor-pointer mr-2"
                  onClick={() => setIsReviewsOpen(!isReviewsOpen)}
                >
                  {isReviewsOpen ? "Hide Reviews" : "All Reviews"}
                </span>
                <BiMessage
                  size={20}
                  className="dark:text-[#ffffff83] cursor-pointer text-[#000000b8]"
                />
                <span className="pl-1 -mt-1 cursor-pointer text-[#000000b8] dark:text-[#ffffff83]">
                  {course?.reviews?.length || 0}
                </span>
              </div>

              {isReviewsOpen && (course?.reviews && [...course.reviews].reverse())?.map(
                (item: { _id?: string; user?: { _id?: string; name?: string; avatar?: { url?: string } }; rating?: number; comment?: string; createdAt?: string; commentReplies?: Array<{ _id?: string; user?: { name?: string; avatar?: { url?: string }; role?: string }; comment?: string; createdAt?: string }> }, index: number) => {
                  
                  return (
                    <div className="w-full my-5 dark:text-white text-black" key={index}>
                      <div className="w-full flex">
                        <div>
                          <Image
                              src={getAvatarUrl(item?.user)}
                            width={50}
                            height={50}
                            alt=""
                            className="w-[50px] h-[50px] rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-2">
                          <h1 className="text-[18px]">{item?.user.name}</h1>
                          <Ratings rating={item.rating} />
                          <p>{item.comment}</p>
                          <small className="text-[#0000009e] dark:text-[#ffffff83]">
                            {format(item.createdAt)} •
                          </small>
                        </div>
                      </div>
                      {user && (
                        <span
                          className={`${styles.label} ml-10! cursor-pointer`}
                          onClick={() => {
                            if (isReviewReply && reviewId === item._id) {
                              setIsReviewReply(false);
                              setReviewId("");
                            } else {
                              setIsReviewReply(true);
                              setReviewId(item._id);
                            }
                          }}
                        >
                          {isReviewReply && reviewId === item._id
                            ? "Hide Reply"
                            : "Add Reply"}
                        </span>
                      )}

                      {isReviewReply && reviewId === item._id && (
                        <div className="w-full mt-3 ml-6 800px:ml-20 pl-4 800px:pl-6 border-l-2 border-purple-400/30 flex relative">
                          <input
                            type="text"
                            placeholder="Enter your reply..."
                            value={reply}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReply(e.target.value)}
                            className="block mt-2 outline-none bg-transparent border-b border-purple-400/30 dark:text-white text-black dark:border-purple-300/40 p-[5px] w-[95%]"
                          />
                          <button
                            type="submit"
                            className="absolute right-0 bottom-1 bg-purple-400 hover:bg-purple-500 transition-colors text-white px-3 py-1 rounded"
                            onClick={handleReviewReplySubmit}
                          >
                            Submit
                          </button>
                        </div>
                      )}

                      {item.commentReplies.length > 0 && (
                        <div className="w-full mt-3 ml-6 800px:ml-20 pl-4 800px:pl-6 border-l-2 border-purple-400/30">
                          {item.commentReplies.map((i: { _id?: string; user?: { name?: string; avatar?: { url?: string } }; comment?: string; createdAt?: string }, index: number) => (
                            <div className="w-full flex my-5 text-black dark:text-white" key={i?._id || i?.createdAt || `review-reply-${item?._id || "review"}-${index}`}>
                              <div className="w-[50px] h-[50px]">
                                <Image
                                  src={getAvatarUrl(i?.user)}
                                  width={50}
                                  height={50}
                                  alt=""
                                  className="w-[50px] h-[50px] rounded-full object-cover"
                                />
                              </div>
                              <div className="pl-2">
                                <div className="flex items-center">
                                  <h5 className="text-[20px]">{i.user.name}</h5>{" "}
                                  <VscVerifiedFilled className="text-purple-300 ml-2 text-[20px]" />
                                </div>
                                <p>{i.comment}</p>
                                <small className="text-[#000000b8] dark:text-[#ffffff83]">
                                  {format(i.createdAt)} •
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </>
        </div>
      )}
    </div>
  );
};

type CommentReplyProps = {
  data: CourseLesson[];
  activeVideo: number;
  answer: string;
  setAnswer: (v: string) => void;
  handleAnswerSubmit: () => void;
  questionId: string;
  setQuestionId: (id: string) => void;
  answerCreationLoading: boolean;
};

const CommentReply = ({
  data,
  activeVideo,
  answer,
  setAnswer,
  handleAnswerSubmit,
  questionId,
  setQuestionId,
  answerCreationLoading,
}: CommentReplyProps) => {
  return (
    <>
      <div className="w-full my-3">
        {data[activeVideo]?.questions?.map((item: { _id?: string; [key: string]: unknown }, index: number) => (
          <CommentItem
            key={item?._id || `question-${index}`}
            data={data}
            activeVideo={activeVideo}
            item={item}
            index={index}
            answer={answer}
            setAnswer={setAnswer}
            questionId={questionId}
            setQuestionId={setQuestionId}
            handleAnswerSubmit={handleAnswerSubmit}
            answerCreationLoading={answerCreationLoading}
          />
        ))}
      </div>
    </>
  );
};

type CommentItemProps = {
  questionId: string;
  setQuestionId: (id: string) => void;
  item: {
    _id: string;
    question?: string;
    createdAt?: string;
    user?: { name?: string; avatar?: { url?: string } };
    questionReplies: Array<{ _id?: string; answer?: string; createdAt?: string; updatedAt?: string; user?: { name?: string; avatar?: { url?: string }; role?: string } }>;
  };
  answer: string;
  setAnswer: (v: string) => void;
  handleAnswerSubmit: () => void;
  answerCreationLoading: boolean;
};

const CommentItem = ({
  questionId,
  setQuestionId,
  item,
  answer,
  setAnswer,
  handleAnswerSubmit,
  answerCreationLoading,
}: CommentItemProps) => {
  const [replyActive, setreplyActive] = useState(false);
  return (
    <>
      <div className="my-4">
        <div className="flex mb-2">
          <div>
            <Image
              src={getAvatarUrl(item?.user)}
              width={50}
              height={50}
              alt=""
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
          </div>
          <div className="pl-3 dark:text-white text-black">
            <h5 className="text-[20px]">{item?.user.name}</h5>
            <p>{item?.question}</p>
            <small className="text-[#000000b8] dark:text-[#ffffff83]">
              {!item.createdAt ? "" : format(item?.createdAt)} •
            </small>
          </div>
        </div>
        <div className="w-full flex">
          <span
            className="800px:pl-16 text-[#000000b8] dark:text-[#ffffff83] cursor-pointer mr-2"
            onClick={() => {
              setreplyActive(!replyActive);
              setQuestionId(item._id);
            }}
          >
            {!replyActive
              ? item.questionReplies.length !== 0
                ? "All Replies"
                : "Add Reply"
              : "Hide Replies"}
          </span>
          <BiMessage
            size={20}
            className="dark:text-[#ffffff83] cursor-pointer text-[#000000b8]"
          />
          <span className="pl-1 -mt-1 cursor-pointer text-[#000000b8] dark:text-[#ffffff83]">
            {item.questionReplies.length}
          </span>
        </div>

        {replyActive && questionId === item._id &&  (
          <div className="w-full mt-3 ml-6 800px:ml-20 pl-4 800px:pl-6 border-l-2 border-purple-400/30">
            {item.questionReplies?.map((replyItem: { _id?: string; answer?: string; createdAt?: string; updatedAt?: string; user?: { name?: string; avatar?: { url?: string }; role?: string } }, replyIndex: number) => (
              <div
                className="w-full flex my-5 text-black dark:text-white"
                key={replyItem?._id || replyItem?.createdAt || `reply-${item?._id || "question"}-${replyIndex}`}
              >
                <div>
                  <Image
                    src={getAvatarUrl(replyItem?.user)}
                    width={50}
                    height={50}
                    alt=""
                    className="w-[50px] h-[50px] rounded-full object-cover"
                  />
                </div>
                <div className="pl-3">
                  <div className="flex items-center">
                    <h5 className="text-[20px]">{replyItem?.user?.name}</h5>{" "}
                    {replyItem?.user?.role === "admin" && (
                      <VscVerifiedFilled className="text-purple-400 ml-2 text-[20px]" />
                    )}
                  </div>
                  <p>{replyItem?.answer}</p>
                  <small className="text-[#000000b8] dark:text-[#ffffff83]">
                    {format(replyItem?.createdAt || replyItem?.updatedAt || item?.createdAt)
                      ? `${format(replyItem?.createdAt || replyItem?.updatedAt || item?.createdAt)} •`
                      : ""}
                  </small>
                </div>
              </div>
            ))}
            <div className="w-full flex relative dark:text-white text-black">
                <input
                  type="text"
                  placeholder="Enter your answer..."
                  value={answer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
                  className={`block mt-2 outline-none bg-transparent border-b border-purple-400/30 dark:text-white text-black dark:border-purple-300/40 p-[5px] w-[95%] ${
                    answer === "" ||
                    (answerCreationLoading && "cursor-not-allowed")
                  }`}
                />
                <button
                  type="submit"
                  className="bg-purple-400 absolute right-0 bottom-1 hover:bg-purple-500 transition-colors text-white px-3 py-1 rounded"
                  onClick={handleAnswerSubmit}
                  disabled={answer === "" || answerCreationLoading}
                >
                  Submit
                </button>
            </div>
            <br />
          </div>
        )}
      </div>
    </>    
  );
};

export default CourseContentMedia;
