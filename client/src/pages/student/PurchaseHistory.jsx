import React from "react";
import { useSelector } from "react-redux";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import LoadingScreen from "./loadingscreen";

const PurchaseHistory = () => {
  const { user } = useSelector((store) => store.auth);

  // don't fetch if not logged in
  const {
    data: purchaseData,
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useGetPurchasedCoursesQuery(undefined, { skip: !user });

  const {
    data: publishedData,
    isLoading: publishedLoading,
    error: publishedError,
  } = useGetPublishedCourseQuery();

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Please log in to view your purchase history.
      </div>
    );
  }

  if (purchasesLoading || publishedLoading) {
     <LoadingScreen />
  }

  if (purchasesError || publishedError) {
    return (
      <div className="text-center mt-10 text-red-500">
        Failed to load purchase history.
      </div>
    );
  }

  const purchases = purchaseData?.purchasedCourse || [];
  const publishedList = Array.isArray(publishedData)
    ? publishedData
    : publishedData?.courses || [];

  // Only show those purchases where:
  // 1. It belongs to the current user (purchase.userId === user._id)
  // 2. The course still exists and is published
  const visiblePurchases = purchases.filter((p) => {
    const course = p.courseId;
    return (
      p.userId === user._id &&
      course &&
      publishedList.some((pub) => String(pub._id) === String(course._id))
    );
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-2">
      <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
      {visiblePurchases.length === 0 ? (
        <div className="text-center text-gray-600">No purchases found.</div>
      ) : (
        <div className="space-y-6">
          {visiblePurchases.map((purchase) => {
            const course = purchase.courseId;
            return (
              <Card
                key={purchase._id}
                className="flex flex-col md:flex-row items-center p-4"
              >
                <img
                  src={course.courseThumbnail || "/default-course.jpg"}
                  alt={course.courseTitle}
                  className="w-28 h-28 object-cover rounded-md border mb-3 md:mb-0 md:mr-6"
                />
                <CardContent className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <Link
                        to={`/course-detail/${course._id}`}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        {course.courseTitle}
                      </Link>
                      <div className="text-gray-300 text-sm mb-1">
                        {course.courseSubtitle}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        <span className="font-medium">Category:</span>{" "}
                        {course.category} &nbsp;|&nbsp;
                        <span className="font-medium">Level:</span>{" "}
                        {course.courseLevel}
                      </div>
                    </div>
                    <div className="md:text-right mt-2 md:mt-0">
                      <div>
                        <span className="font-semibold">Amount Paid:</span> ₹
                        {purchase.amount}
                      </div>
                      <div>
                        <span className="font-semibold">Invoice #:</span>{" "}
                        {purchase.invoiceNumber || "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span>{" "}
                        {purchase.purchaseDate
                          ? new Date(purchase.purchaseDate).toLocaleDateString()
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span>{" "}
                        <span
                          className={
                            purchase.status === "completed"
                              ? "text-green-600"
                              : "text-yellow-500"
                          }
                        >
                          {purchase.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link
                      to={`/course-progress/${course._id}`}
                      className="text-cyan-600 hover:underline font-medium"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
