// src/components/BuyCourseButton.jsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import Logo from "@/components/Logo";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
  const [
    createCheckoutSession,
    { data, isLoading, isSuccess, isError, error },
  ] = useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    try {
      // Pass an object so that the backend sees { courseId: "..." }
      await createCheckoutSession({ courseId }).unwrap();
    } catch (err) {
      // We’ll rely on isError / error in the useEffect below
    }
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.url) {
        // Redirect to the Stripe checkout page
        window.location.assign(data.url);
      } else {
        toast.error("Invalid response from server.");
      }
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session");
    }
  }, [data, isSuccess, isError, error]);

  return (
    <Button
      onClick={purchaseCourseHandler}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <div className="flex items-center">
            <span className="text-lg font-bold">Loading…</span>
          </div>
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
