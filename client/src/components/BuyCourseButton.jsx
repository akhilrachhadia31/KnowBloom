// src/components/BuyCourseButton.jsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const BuyCourseButton = ({ courseId }) => {
  const { user } = useSelector((store) => store.auth);
  const [
    createCheckoutSession,
    { data, isLoading, isSuccess, isError, error },
  ] = useCreateCheckoutSessionMutation();

  const handlePurchase = async () => {
    try {
      // backend expects { courseId }
      await createCheckoutSession({ courseId }).unwrap();
    } catch {
      // error handled in useEffect
    }
  };

  useEffect(() => {
    if (isSuccess && data) {
      const {
        orderId,
        amount,
        currency,
        razorpayKey,
        courseTitle,
        courseThumbnail,
      } = data;
      const options = {
        key: razorpayKey,
        amount,
        currency,
        name: courseTitle,
        image: courseThumbnail,
        order_id: orderId,
        handler: (response) => {
          toast.success("Payment successful!");
          window.location.reload();
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        notes: { courseId },
        theme: { color: "#3399cc" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (err) => {
        console.error(err);
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to initiate payment");
    }
  }, [isSuccess, isError, data, error, user, courseId]);

  return (
    <Button onClick={handlePurchase} disabled={isLoading} className="w-full">
      {isLoading ? "Processing…" : "Purchase Course"}
    </Button>
  );
};

export default BuyCourseButton;
