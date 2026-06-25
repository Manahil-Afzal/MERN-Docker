"use client";

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
import React, { useEffect, useRef, useState } from "react";
import {
  AiFillStar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineStar,
} from "react-icons/ai";
import { BiMessage } from "react-icons/bi";
import { VscVerifiedFilled } from "react-icons/vsc";
import toast from "react-hot-toast";
import socketIO from "socket.io-client";

const ENDPOINT =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URI;

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
  questions?: any[];
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
  setActiveVideo: (v: number) => void;
  user?: CourseUser;
  refetch?: () => void;
};

/* ---------------- helpers ---------------- */

const format = (value?: string | Date) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getAvatarUrl = (p?: { avatar?: { url?: string } }) =>
  p?.avatar?.url ||
  "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png";

const getLinkUrl = (l: any) =>
  String(l?.url || l?.href || l?.link || l?.videoUrl || "");

const isVideo = (url: string) =>
  /youtube|youtu\.be|vimeo|\.mp4|\.webm|\.ogg|\.m3u8|\.mov/i.test(url);

/* ---------------- main component ---------------- */

const CourseContentMedia = ({
  data,
  id,
  activeVideo,
  setActiveVideo,
  user,
  refetch,
}: Props) => {
  const [activeBar, setActiveBar] = useState(0);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionId, setQuestionId] = useState("");

  const [review, setReview] = useState("");
  const [rating, setRating] = useState(1);

  const [reply, setReply] = useState("");
  const [reviewId, setReviewId] = useState("");

  const [isReviewReply, setIsReviewReply] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const [selectedResourceUrl, setSelectedResourceUrl] = useState("");

  const socketRef = useRef<any>(null);

  const currentLesson = data?.[activeVideo];

  const { data: courseData, refetch: courseRefetch } =
    useGetCourseDetailsQuery(id);

  const course = courseData?.course;

  const [addQuestion, qState] = useAddQuestionMutation();
  const [addAnswer, aState] = useAddAnswerMutation();
  const [addReview, rState] = useAddReviewMutation();
  const [addReply, rpState] = useAddReplyMutation();

  /* ---------------- socket ---------------- */

  useEffect(() => {
    socketRef.current = socketIO(ENDPOINT, { transports: ["websocket"] });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  /* ---------------- handlers ---------------- */

  const handleQuestion = () => {
    if (!question.trim()) return toast.error("Empty question");

    if (!currentLesson?._id) return;

    addQuestion({
      question,
      courseId: id,
      contentId: currentLesson._id,
    });
  };

  const handleAnswer = () => {
    if (!answer.trim()) return toast.error("Empty answer");

    addAnswer({
      answer,
      courseId: id,
      contentId: currentLesson?._id,
      questionId,
    });
  };

  const handleReview = () => {
    if (!review.trim()) return toast.error("Empty review");

    addReview({
      review,
      rating,
      courseId: id,
    });
  };

  const handleReply = () => {
    if (!reply.trim()) return toast.error("Empty reply");

    addReply({
      comment: reply,
      courseId: id,
      reviewId,
    });
  };

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (qState.isSuccess) {
      setQuestion("");
      refetch?.();
      toast.success("Question submitted");

      socketRef.current?.emit("notification", {
        title: "New Question",
        message: `New question in ${currentLesson?.title}`,
        userId: user?._id,
      });

      qState.reset();
    }

    if (aState.isSuccess) {
      setAnswer("");
      refetch?.();
      toast.success("Answer submitted");
      aState.reset();
    }

    if (rState.isSuccess) {
      setReview("");
      setRating(1);
      courseRefetch();
      toast.success("Review added");
      rState.reset();
    }

    if (rpState.isSuccess) {
      setReply("");
      courseRefetch();
      toast.success("Reply added");
      rpState.reset();
    }
  }, [
    qState.isSuccess,
    aState.isSuccess,
    rState.isSuccess,
    rpState.isSuccess,
  ]);

  /* ---------------- navigation ---------------- */

  const total = data?.length || 0;

  const prev = () => {
    if (activeVideo > 0) setActiveVideo(activeVideo - 1);
  };

  const next = () => {
    if (activeVideo < total - 1) setActiveVideo(activeVideo + 1);
  };

  const videoUrl =
    selectedResourceUrl ||
    currentLesson?.videoUrl ||
    currentLesson?.videoPlayer ||
    "";

  /* ---------------- UI ---------------- */

  if (!currentLesson) return null;

  return (
    <div className="w-[60%] 800px:w-[86%] m-auto py-4">

      if (!currentLesson) return null;

      <CoursePlayer
        title={currentLesson.title || "Lesson"}
        videoUrl={videoUrl || ""}
      />

      <div className="flex justify-between my-3">
        <button onClick={prev} className={styles.button}>
          <AiOutlineArrowLeft /> Prev
        </button>

        <button onClick={next} className={styles.button}>
          Next <AiOutlineArrowRight />
        </button>
      </div>

      <h1 className="text-[25px] font-semibold">{currentLesson.title}</h1>

      {/* Tabs */}
      <div className="flex justify-between bg-purple-400/10 p-4 mt-3">
        {["Overview", "Resources", "Q&A", "Reviews"].map((t, i) => (
          <h5
            key={i}
            onClick={() => setActiveBar(i)}
            className={activeBar === i ? "text-purple-400" : ""}
          >
            {t}
          </h5>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeBar === 0 && (
        <p className="whitespace-pre-line mt-4">
          {currentLesson.description}
        </p>
      )}

      {/* RESOURCES */}
      {activeBar === 1 && (
        <div>
          {(currentLesson.links || []).map((l, i) => {
            const url = getLinkUrl(l);

            return (
              <div key={i}>
                <a
                  href={url}
                  target="_blank"
                  onClick={() => isVideo(url) && setSelectedResourceUrl(url)}
                >
                  {url}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Q&A */}
      {activeBar === 2 && (
        <div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border w-full p-2"
          />
          <button onClick={handleQuestion} className={styles.button}>
            Submit Question
          </button>
        </div>
      )}

      {/* REVIEWS */}
      {activeBar === 3 && (
        <div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="border w-full p-2"
          />

          <button onClick={handleReview} className={styles.button}>
            Submit Review
          </button>

          <div className="mt-4">
            {(course?.reviews || []).map((r: any, i: number) => (
              <div key={i}>
                <p>{r.comment}</p>
                <Ratings rating={r.rating} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContentMedia;