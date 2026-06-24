"use client";

import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { redirect } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import Loader from "@/app/components/Loader/Loader";
import CourseContent from "@/app/components/Course/CourseContent";
import { useCreateOrderMutation } from "@/redux/features/orders/ordersApi";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type UserCourse = {
  courseId?: string;
  _id?: string;
};

const CourseAccessPage = ({ params }: Props) => {
  const { id } = React.use(params);

  const {
    isLoading,
    error,
    data,
    refetch: refetchUser,
  } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createOrder, { data: orderData, error: orderError }] =
    useCreateOrderMutation();

  // Handle Stripe redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (paymentIntent && redirectStatus === "succeeded") {
      createOrder({
        courseId: id,
        payment_info: {
          id: paymentIntent,
        },
      });
    }
  }, [id, createOrder]);

  // Refetch user after successful order
  useEffect(() => {
    if (orderData) {
      refetchUser();
    }
  }, [orderData, refetchUser]);

  const isAuthorized = useMemo(() => {
    if (!data?.user?.courses || !Array.isArray(data.user.courses)) {
      return false;
    }

    return data.user.courses.some((item: string | UserCourse) => {
      const purchasedId =
        typeof item === "string"
          ? item
          : item.courseId || item._id;

      return String(purchasedId) === String(id);
    });
  }, [data, id]);

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthorized &&
      !orderData &&
      !orderError
    ) {
      redirect("/");
    }

    if (error) {
      redirect("/");
    }
  }, [
    isLoading,
    isAuthorized,
    orderData,
    orderError,
    error,
  ]);

  return (
    <>
      {isLoading || !isAuthorized ? (
        <Loader />
      ) : (
        <div>
          <CourseContent id={id} />
        </div>
      )}
    </>
  );
};

export default CourseAccessPage;