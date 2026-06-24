import { styles } from "@/app/styles/style";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { useCreateOrderMutation } from "@/redux/features/orders/ordersApi";
import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeError } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socketIO from "socket.io-client";

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });


type Props = {
  setOpen: (value: boolean) => void;
  data: {
    _id: string;
    name?: string;
  };
};

const CheckoutForm = ({ setOpen, data }: Props) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string>("");
  const [createOrder, { data: orderData, error }] = useCreateOrderMutation();
  const [isLoading, setIsLoading] = useState(false);
  useLoadUserQuery(undefined, { skip: true });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setMessage("Stripe not loaded. Please refresh and try again.");
      return;
    }

    const returnUrl = `${window.location.origin}/course-access/${data._id}`;

    setIsLoading(true);
    setMessage("");

    try {
      // Confirm payment with payment element collecting the payment method
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "always", // Always redirect for redirect-required payment methods
      }) as { error?: StripeError; paymentIntent?: unknown } | undefined;

      // If we get here without a redirect, check for errors
      if (result?.error) {
        setMessage(result.error.message ?? "Payment failed");
        setIsLoading(false);
        return;
      }

      // If payment succeeded without redirect
      if (
        result?.paymentIntent &&
        typeof result.paymentIntent === "object" &&
        (result.paymentIntent as { status?: string }).status === "succeeded"
      ) {
        setMessage("");
        await createOrder({ courseId: data._id, payment_info: result.paymentIntent });
        setIsLoading(false);
        return;
      }

      setMessage("Payment was not completed.");
      setIsLoading(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setMessage(error.message || "An error occurred during payment");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderData) {
      setOpen(false);
      socketId.emit("notification", {
        title: "New Order",
        message: `You have a new order for ${data.name || 'course'}`,
      });
      toast.success("Order created successfully! Redirecting to course...");
      setTimeout(() => {
        router.push(`/course-access/${data._id}`);
      }, 1000);
    }

    if (error && "data" in error) {
      const errorMessage = error as { data?: { message?: string } };
      toast.error(errorMessage?.data?.message || "Order creation failed");
    }
  }, [orderData, error, data?._id, data.name, router, setOpen]);

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <LinkAuthenticationElement id="link-authentication-element" />
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text" className={`${styles.button} bg-purple-400 mt-2 h-[35px]!`}>
          {isLoading ? "Paying..." : "Pay now"}
        </span>
      </button>
      {message && (
        <div id="payment-message" className="text-purple-400 font-Poppins pt-2">
          {message}
        </div>      
      )}
    </form>
  );
};

export default CheckoutForm;
