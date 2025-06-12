import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
<<<<<<< HEAD
=======
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY environment variable is not set");
  }
>>>>>>> e0bb359b91c4b7263b1c50098be3c68aee652981
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
<<<<<<< HEAD
      sameSite: "none",
      secure: true,
=======
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
>>>>>>> e0bb359b91c4b7263b1c50098be3c68aee652981
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .json({
      success: true,
      message,
      user,
    });
};
<<<<<<< HEAD
=======

// import jwt from "jsonwebtoken";

// export const generateToken = (res, user, message) => {
//   const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
//     expiresIn: "1d",
//   });

//   return res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     })
//     .json({
//       success: true,
//       message,
//       user,
//     });
// };
>>>>>>> e0bb359b91c4b7263b1c50098be3c68aee652981
