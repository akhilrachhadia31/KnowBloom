// src/controllers/coursePurchase.controller.js

import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js"; // If you have a separate Lecture model; otherwise skip
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
import { Module } from "../models/module.model.js";
import { sendPurchaseConfirmationEmail } from "../utils/email.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

dotenv.config();

// Ensure STRIPE_SECRET_KEY is provided
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("⚠️ STRIPE_SECRET_KEY is not defined in your .env!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/v1/purchase/checkout/create-checkout-session
 * Expects req.body.courseId
 * Creates a Stripe Checkout Session and returns { url }
 */
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const userId = req.id; // set by isAuthenticated middleware
//     const { courseId } = req.body;

//     if (!courseId) {
//       return res.status(400).json({ message: "courseId is required in body." });
//     }

//     // 1) Fetch the course to get its price, title, thumbnail, etc.
//     const course = await Course.findById(courseId).lean();
//     if (!course) {
//       return res.status(404).json({ message: "Course not found!" });
//     }

//     // 2) Ensure price is a valid number
//     const priceRupees = Number(course.coursePrice || 0);
//     if (isNaN(priceRupees)) {
//       console.warn(
//         `Warning: course.coursePrice is not a number for courseId=${courseId}. Defaulting to 0.`
//       );
//     }

//     // 3) Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: course.courseTitle || "Course Purchase",
//               images: course.courseThumbnail ? [course.courseThumbnail] : [],
//             },
//             unit_amount: Math.round(priceRupees * 100), // amount in paise
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `https://knowbloom.onrender.com/course-progress/${courseId}`,
//       cancel_url: `https://knowbloom.onrender.com/course-detail/${courseId}`,
//       metadata: {
//         courseId,
//         userId,
//       },
//       shipping_address_collection: {
//         allowed_countries: ["IN"],
//       },
//     });

//     if (!session || !session.id || !session.url) {
//       console.error("Stripe session creation failed:", session);
//       return res
//         .status(500)
//         .json({ message: "Stripe session did not return a valid URL." });
//     }

//     // 4) Create the CoursePurchase document including paymentId
//     const newPurchase = new CoursePurchase({
//       courseId,
//       userId,
//       amount: priceRupees,
//       status: "pending",
//       paymentId: session.id,
//     });

//     await newPurchase.save();

//     // 5) Return the Stripe checkout URL
//     return res.status(200).json({
//       url: session.url,
//     });
//   } catch (error) {
//     console.error("createCheckoutSession error:", error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal Server Error" });
//   }
// };

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const priceRupees = Number(course.coursePrice || 0);
    const amountPaise = Math.round(priceRupees * 100);

    // 1) Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { courseId, userId },
    });

    // 2) Persist pending purchase
    await CoursePurchase.create({
      courseId,
      userId,
      amount: priceRupees,
      status: "pending",
      paymentId: order.id,
    });

    // 3) Return order details
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      courseTitle: course.courseTitle,
      courseThumbnail: course.courseThumbnail,
    });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/v1/purchase/webhook
 * Handles Stripe webhook events (e.g. checkout.session.completed)
 */
// export const stripeWebhook = async (req, res) => {
//   let event;

//   try {
//     // Stripe expects the raw body for verification.
//     const payloadString = JSON.stringify(req.body, null, 2);
//     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;
//     if (!secret) {
//       console.error("⚠️ WEBHOOK_ENDPOINT_SECRET is not set in .env!");
//       return res.status(400).send("Webhook secret not configured");
//     }
//     const header = stripe.webhooks.generateTestHeaderString({
//       payload: payloadString,
//       secret,
//     });
//     event = stripe.webhooks.constructEvent(payloadString, header, secret);
//   } catch (error) {
//     console.error("stripeWebhook signature error:", error.message);
//     return res.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   // Only handle checkout.session.completed
//   if (event.type === "checkout.session.completed") {
//     console.log("stripeWebhook: checkout.session.completed");

//     try {
//       const session = event.data.object;
//       const purchase = await CoursePurchase.findOne({
//         paymentId: session.id,
//       }).populate({ path: "courseId" });

//       if (!purchase) {
//         console.warn("purchase not found for paymentId:", session.id);
//         return res.status(404).json({ message: "Purchase not found" });
//       }

//       // Mark this purchase as completed
//       if (session.amount_total) {
//         purchase.amount = session.amount_total / 100;
//       }
//       purchase.status = "completed";
//       await purchase.save();

//       // Add courseId to user.enrolledCourses
//       await User.findByIdAndUpdate(
//         purchase.userId,
//         { $addToSet: { enrolledCourses: purchase.courseId._id } },
//         { new: true }
//       );

//       // Add userId to course.enrolledStudents and increment count
//       await Course.findByIdAndUpdate(
//         purchase.courseId._id,
//         {
//           $addToSet: { studentsEnrolled: purchase.userId },
//           $inc: { studentsEnrolledCount: 1 },
//         },
//         { new: true }
//       );
//       try {
//         // 1) Fetch user details
//         const user = await User.findById(purchase.userId).lean();
//         if (user && user.email) {
//           // 2) Prepare data for the invoice email
//           const userName = user.name || "Student";
//           const toEmail = user.email;
//           const courseTitle = purchase.courseId.courseTitle || "Your Course";
//           const amountPaid = purchase.amount || 0;
//           const purchaseDate = new Date().toLocaleDateString("en-IN", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           });
//           const invoiceNumber = purchase._id.toString().slice(-6).toUpperCase();
//           // e.g. last 6 chars of the purchase document ID
//           purchase.invoiceNumber = invoiceNumber;
//           purchase.purchaseDate = new Date(); // or use the purchaseDate you formatted
//           await purchase.save();
//           // 3) Send the “Congratulations” email with invoice
//           await sendPurchaseConfirmationEmail({
//             toEmail,
//             userName,
//             courseTitle,
//             amountPaid,
//             invoiceNumber,
//             purchaseDate,
//           });
//           console.log(`Purchase email sent to ${toEmail}`);
//         } else {
//           console.warn(
//             "Page not found or missing email; cannot send invoice email."
//           );
//         }
//       } catch (emailError) {
//         console.error("Error sending purchase confirmation email:", emailError);
//         // Do NOT fail the entire webhook if email sending fails—just log it.
//       }
//       // --- END NEW EMAIL BLOCK ---
//     } catch (error) {
//       console.error("stripeWebhook event handling error:", error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   }

//   // Acknowledge receipt
//   res.status(200).send();
// };

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_SECRET;
    const body = req.body; // parsed JSON
    const rawBody = req.rawBody || JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    const receivedSignature = req.headers["x-razorpay-signature"];

    if (expectedSignature !== receivedSignature) {
      console.warn("Invalid Razorpay signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const { event, payload } = body;
    if (event === "payment.captured") {
      const orderId = payload.payment.entity.order_id;

      // 1) Find the pending purchase
      const purchase = await CoursePurchase.findOne({ paymentId: orderId });
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      // 2) Mark completed
      purchase.status = "completed";
      purchase.purchaseDate = new Date();
      await purchase.save();

      // 3) Enroll user & increment counts
      await User.findByIdAndUpdate(purchase.userId, {
        $addToSet: { enrolledCourses: purchase.courseId },
      });
      await Course.findByIdAndUpdate(purchase.courseId, {
        $addToSet: { studentsEnrolled: purchase.userId },
        $inc: { studentsEnrolledCount: 1 },
      });

      // 4) Send confirmation email (best-effort)
      try {
        const userDoc = await User.findById(purchase.userId).lean();
        if (userDoc?.email) {
          const invoiceNumber = purchase._id.toString().slice(-6).toUpperCase();
          await sendPurchaseConfirmationEmail({
            toEmail: userDoc.email,
            userName: userDoc.name || "Student",
            courseTitle: purchase.courseTitle,
            amountPaid: purchase.amount,
            invoiceNumber,
            purchaseDate: purchase.purchaseDate,
          });
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    }

    // Acknowledge webhook
    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("razorpayWebhook error:", err);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};

/**
 * GET /api/v1/purchase/course/:courseId/detail-with-status
 * Returns: { course, purchased: Boolean, isCreator: Boolean }
 */
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    console.log("Requested courseId:", courseId, "by userId:", userId);

    // 1. Fetch course document (with creator info)
    const courseDoc = await Course.findById(courseId)
      .populate({ path: "creator", select: "name photoUrl bio email _id" })
      .lean();

    if (!courseDoc) {
      console.log("Course not found!");
      return res.status(404).json({ message: "Course not found!" });
    }

    // 2. Fetch all modules for this course (and their lectures)
    let modules = [];
    try {
      modules = await Module.find({ course: courseId })
        .populate({
          path: "lectures",
          select: "lectureTitle videoUrl preview publicId duration _id",
        })
        .lean();
    } catch (err) {
      console.log("Error populating modules/lectures:", err);
      modules = [];
    }

    // 3. Fetch legacy lectures if any
    let legacyLectureDocs = [];
    try {
      if (Array.isArray(courseDoc.lectures) && courseDoc.lectures.length > 0) {
        legacyLectureDocs = await Lecture.find({
          _id: { $in: courseDoc.lectures },
        })
          .select("lectureTitle videoUrl preview publicId duration _id")
          .lean();
      }
    } catch (err) {
      console.log("Error fetching legacy lectures:", err);
      legacyLectureDocs = [];
    }

    // 4. Gather all lectures for stats
    const allLectures = [
      ...(legacyLectureDocs || []),
      ...(modules || []).flatMap((m) => m.lectures || []),
    ];
    const totalLectures = allLectures.length;
    const totalTime = allLectures.reduce(
      (acc, lec) => acc + (lec.duration || 0),
      0
    );

    // 5. Get enrolled count (robust)
    let enrolledCount = 0;
    try {
      enrolledCount = await CoursePurchase.countDocuments({
        courseId,
        status: "completed",
      });
    } catch (err) {
      console.log("Error counting enrollments:", err);
      enrolledCount = 0;
    }

    // 6. Is user creator?
    let isCreator = false;
    if (Array.isArray(courseDoc.creator)) {
      isCreator = courseDoc.creator.some(
        (c) => String(c._id) === String(userId)
      );
    } else if (courseDoc.creator && courseDoc.creator._id) {
      isCreator = String(courseDoc.creator._id) === String(userId);
    }

    // 7. Has user purchased?
    let purchased = false;
    try {
      const purchaseRecord = await CoursePurchase.findOne({
        userId,
        courseId,
        status: "completed",
      });
      purchased = !!purchaseRecord;
    } catch (err) {
      purchased = false;
    }

    // 8. Prepare course object for client
    const course = {
      ...courseDoc,
      modules: (modules || []).map((module) => ({
        ...module,
        lectures: module.lectures || [],
      })),
      lectures: legacyLectureDocs || [],
      studentsEnrolledCount: enrolledCount,
      totalLectures,
      totalTime,
      creator: Array.isArray(courseDoc.creator)
        ? courseDoc.creator
        : [courseDoc.creator],
      purchased, // for frontend
    };

    return res.status(200).json({ course, purchased, isCreator });
  } catch (error) {
    console.error("getCourseDetailWithPurchaseStatus ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch course details",
      error: error?.message,
    });
  }
};
/**
 * GET /api/v1/purchase/
 * Returns all completed purchases
 */
export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");

    return res.status(200).json({
      purchasedCourse: purchasedCourse || [],
    });
  } catch (error) {
    console.error("getAllPurchasedCourse error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch purchased courses" });
  }
};
