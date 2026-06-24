"use client";

import CoursePlayer from "@/app/utils/CoursePlayer";
import Ratings from "@/app/utils/Ratings";
import React, { useState } from "react";
import { IoCheckmarkDoneOutline, IoCloseOutline } from "react-icons/io5";

import CourseContentList from "../Course/CourseContentList";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../Payment/CheckoutForm";
import { Stripe } from "@stripe/stripe-js";

import { styles } from "@/app/styles/style";
import Image from "next/image";

type CourseData = {
  _id: string;
  name: string;
  price: number;
  estimatedPrice?: number;
  ratings?: number;
  purchased?: number;
  demoUrl?: string;
  description?: string;
  benefits?: Array<{ title: string }>;
  prerequisites?: Array<{ title: string }>;
  reviews?: unknown[];
  review?: unknown[];
  courseData?: Array<{
    _id: string;
    title: string;
    videoSection: string;
    videoLength: number | string;
  }>;
};

type ReviewItem = {
  _id?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  commentReplies?: Array<{
    _id?: string;
    comment?: string;
    createdAt?: string;
    user?: {
      name?: string;
      avatar?: {
        url?: string;
      };
    };
  }>;
  user?: {
    name?: string;
    avatar?: {
      url?: string;
    };
  };
};

type Props = {
  data: CourseData;
  clientSecret?: string;
  stripePromise: Promise<Stripe | null> | null;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CourseDetails = (props: Props) => {
  const { data, stripePromise, clientSecret } = props;
  const [openPayment, setOpenPayment] = useState(false); // Independent state

  const discountPercentage = data?.estimatedPrice
    ? ((data.estimatedPrice - data.price) / data.estimatedPrice) * 100
    : 0;
  const discountPercentagePrice = discountPercentage.toFixed(0);

  const handleOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpenPayment(true); 
  };

  const reviews = (data?.reviews ?? data?.review ?? []) as ReviewItem[];
  const averageFromReviews = reviews.length
    ? reviews.reduce((sum, item) => sum + Number(item?.rating || 0), 0) /
      reviews.length
    : 0;
  const courseRatings = Number(data?.ratings ?? averageFromReviews ?? 0);

  const getAvatarUrl = (person?: ReviewItem["user"]) =>
    person?.avatar?.url ??
    "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png";

  const formatDate = (value?: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      <div className="w-[95%] 800px:w-[90%] m-auto py-5">
        <div className="w-full flex flex-col-reverse 800px:flex-row gap-5">
          <div className="w-full 800px:w-[65%] 800px:pr-5">
            <h1 className="text-[25px] font-Poppins font-semibold text-black dark:text-white">
              {data?.name}
            </h1>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center">
                <Ratings rating={courseRatings} />
                <h5 className="text-black dark:text-white ml-2">
                  {reviews.length} Reviews
                </h5>
              </div>
              <h5 className="text-black dark:text-white">
                {data?.purchased ?? 0} Students
              </h5>
            </div>

            <div className="mt-4">
              <div className="w-[50%] 800px:w-[50%] aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <CoursePlayer
                  videoUrl={data?.demoUrl ?? ""}
                  title={data?.name ?? "Course Preview"}
                />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-[22px] font-semibold text-black dark:text-white">
                    {data?.price === 0 ? "Free" : `$${data?.price}`}
                  </h4>
                  {data?.estimatedPrice && (
                    <>
                      <h5 className="text-[15px] line-through text-gray-500">
                        ${data.estimatedPrice}
                      </h5>
                      <span className="text-[14px] font-medium text-purple-500 dark:text-purple-400">
                        {discountPercentagePrice}% Off
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  <button
                    className={`${styles.button} w-[180px]! my-3 font-Poppins cursor-pointer bg-purple-400!`}
                    onClick={handleOrder}
                  >
                    Buy Now {data.price}$
                  </button>
                </div>

                <div className="w-full 800px:w-[220px]">
                  <div className="mt-4 space-y-2">
                    <p className="text-[13px] text-black dark:text-gray-300">• Source code included</p>
                    <p className="text-[13px] text-black dark:text-gray-300">• Completion certification</p>
                    <p className="text-[13px] text-black dark:text-gray-300">• Full lifetime access</p>
                    <p className="text-[13px] text-black dark:text-gray-300">• Premium support</p>
                  </div>
                </div>
              </div>
            </div>

            <br />
            <h1 className="text-[25px] font-Poppins font-semibold text-black dark:text-white">What you will learn?</h1>
            <div>
              {data?.benefits?.map((item: { title: string }, index: number) => (
                <div className="w-full flex 800px:items-center py-2" key={index}>
                  <IoCheckmarkDoneOutline size={20} className="text-purple-300 mr-2" />
                  <p className="text-black dark:text-white">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-[25px] py-6 font-Poppins font-semibold text-black dark:text-white">Course Overview</h1>
          <CourseContentList data={data?.courseData} isDemo={true} />
        </div>

        <div className="w-full mt-10">
          <h1 className="text-[25px] font-Poppins font-semibold text-black dark:text-white">Course Details</h1>
          <p className="text-[18px] mt-5 whitespace-pre-line text-black dark:text-white">{data.description}</p>
        </div>

        <div className="w-full mt-10">
          <h1 className="text-[25px] font-Poppins font-semibold text-black dark:text-white">Reviews</h1>
          <div className="mt-5 space-y-5">
            {reviews.length === 0 ? (
              <p className="text-[16px] text-black dark:text-white">No reviews available yet.</p>
            ) : (
              reviews.map((item: ReviewItem, index: number) => (
                <div
                  key={item._id || `course-review-${index}`}
                  className="w-full rounded-xl border border-[#ffffff1d] bg-slate-500 bg-opacity-5 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={getAvatarUrl(item?.user)}
                      width={52}
                      height={52}
                      alt={item?.user?.name || "Review author"}
                      className="w-[52px] h-[52px] rounded-full object-cover border border-purple-400/30"
                      unoptimized
                    />
                    <div className="flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-[18px] font-medium text-black dark:text-white">
                          {item?.user?.name || "Anonymous"}
                        </h2>
                        <small className="text-[#0000009e] dark:text-[#ffffff83]">
                          {formatDate(item?.createdAt)}
                        </small>
                      </div>
                      <Ratings rating={Number(item?.rating || 0)} />
                      <p className="mt-2 text-[15px] leading-relaxed text-black dark:text-white">
                        {item?.comment}
                      </p>

                      {Array.isArray(item?.commentReplies) && item.commentReplies.length > 0 && (
                        <div className="mt-4 border-l-2 border-purple-400/30 pl-4 space-y-4">
                          {item.commentReplies.map((reply, replyIndex) => (
                            <div
                              key={reply?._id || reply?.createdAt || `course-review-reply-${index}-${replyIndex}`}
                              className="flex items-start gap-3"
                            >
                              <Image
                                src={getAvatarUrl(reply?.user)}
                                width={42}
                                height={42}
                                alt={reply?.user?.name || "Reply author"}
                                className="w-[42px] h-[42px] rounded-full object-cover border border-purple-400/20"
                                unoptimized
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <h3 className="text-[15px] font-medium text-black dark:text-white">
                                    {reply?.user?.name || "Admin"}
                                  </h3>
                                  <small className="text-[#0000009e] dark:text-[#ffffff83]">
                                    {formatDate(reply?.createdAt)}
                                  </small>
                                </div>
                                <p className="mt-1 text-[14px] leading-relaxed text-black dark:text-white">
                                  {reply?.comment}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FIXED MODAL: Uses openPayment instead of open */}
      {openPayment && (
        <div className="w-full h-screen bg-[#00000036] fixed top-0 left-0 z-[9999] flex items-center justify-center">
          <div className="w-[500px] min-h-[500px] bg-white rounded-xl shadow p-3">
            <div className="w-full flex justify-end">
              <IoCloseOutline
                size={40}
                className="text-black cursor-pointer"
                onClick={() => setOpenPayment(false)}
              />
            </div>
            <div className="w-full">
              {stripePromise && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#9333ea",
                        colorBackground: "#ffffff",
                        colorText: "#000000",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <CheckoutForm setOpen={setOpenPayment} data={data} />
                </Elements>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
