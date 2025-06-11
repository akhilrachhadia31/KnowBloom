// src/pages/Login.jsx
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
  useVerifyOtpMutation,
  authApi,
} from "@/features/api/authApi";
import Logo from "@/components/Logo";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

// Only letters, numbers, underscore allowed in username:
const usernameRegex = /^[a-zA-Z0-9_]+$/;

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [tab, setTab] = useState("login");

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [registerUser, { error: registerError, isLoading: registerIsLoading }] =
    useRegisterUserMutation();
  const [loginUser, { error: loginError, isLoading: loginIsLoading }] =
    useLoginUserMutation();
  const [verifyOtp, { isLoading: otpIsLoading }] = useVerifyOtpMutation();

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const result = await loginUser({
      email: decoded.email,
      viaGoogle: true,
      name: decoded.name,
    });
    if ("error" in result) {
      toast.error(result.error.data?.message || "Google login failed");
    } else {
      dispatch(authApi.util.resetApiState());
      toast.success("Login successful");
      window.location.href = "/";
    }
  };

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
      setFieldErrors({ ...fieldErrors, [name]: "" });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;

    if (type === "signup" && !usernameRegex.test(signupInput.name)) {
      setFieldErrors((prev) => ({
        ...prev,
        name: "Username must not contain special characters.",
      }));
      return;
    }

    const result = await action({ ...inputData });

    if ("error" in result) {
      const field = result.error?.data?.field;
      if (type === "signup" && field) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: result.error.data.message,
        }));
      } else {
        toast.error(result.error.data?.message || "Action failed");
      }
    } else if (type === "signup") {
      setShowOtpInput(true);
      setCanResend(false);
      setCountdown(30);
      toast.success("OTP sent to your email.");
      setOtpError("");

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setCanResend(true);
            setOtpError("OTP expired. Please resend OTP.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      dispatch(authApi.util.resetApiState());
      toast.success("Login successful");
      window.location.href = "/";
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setCanResend(false);
    setCountdown(30);
    await handleRegistration("signup");
  };

  const handleOtpVerify = async () => {
    const result = await verifyOtp({ email: signupInput.email, otp });
    if ("error" in result) {
      setOtpError("Incorrect OTP. Try again.");
      return;
    }
    toast.success("Signup successful! Please log in.");
    setShowOtpInput(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCanResend(false);
    setOtp("");
    setOtpError("");
  };

  return (
    <div>
      <div className="flex items-center w-full justify-center mt-20 mb-20">
        <Tabs value={tab} onValueChange={setTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Signup</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Signup</CardTitle>
                <CardDescription>Create your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={signupInput.name}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="abc"
                    required
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-sm">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={signupInput.email}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="abc@gmail.com"
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={signupInput.password}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    required
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  disabled={registerIsLoading}
                  onClick={() => handleRegistration("signup")}
                  className="w-full mb-3"
                >
                  {registerIsLoading ? "Signing up…" : "Signup"}
                </Button>

                <AlertDialog open={showOtpInput} onOpenChange={setShowOtpInput}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Enter OTP</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please enter the 6-digit OTP sent to your email to
                        verify your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                      <InputOTP
                        maxLength={6}
                        onChange={(value) => {
                          setOtp(value.replace(/\D/g, ""));
                          setOtpError("");
                        }}
                        value={otp}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <p className="text-sm text-gray-500">
                        Time remaining: {countdown} seconds
                      </p>
                      {otpError && (
                        <p className="text-red-500 text-sm">{otpError}</p>
                      )}
                    </div>
                    <AlertDialogFooter>
                      <div className="flex-grow text-left">
                        <Button
                          variant="link"
                          onClick={handleResendOtp}
                          disabled={countdown > 0 || registerIsLoading}
                          className="p-0 text-sm"
                        >
                          Resend OTP
                        </Button>
                      </div>
                      <AlertDialogCancel
                        onClick={() => {
                          setShowOtpInput(false);
                          setSignupInput({ name: "", email: "", password: "" });
                          clearInterval(intervalRef.current);
                          setCanResend(false);
                          setOtp("");
                          setOtpError("");
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        onClick={handleOtpVerify}
                        disabled={otpIsLoading || otp.length < 6}
                      >
                        {otpIsLoading ? "Verifying…" : "Verify OTP"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <p className="text-center text-sm">
                  Already have an account?{" "}
                  <span
                    className="underline underline-offset-4 cursor-pointer"
                    onClick={() => setTab("login")}
                  >
                    Login
                  </span>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Login to your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={loginInput.email}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={loginInput.password}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  disabled={loginIsLoading}
                  onClick={() => handleRegistration("login")}
                  className="w-full"
                >
                  {loginIsLoading ? "Logging in…" : "Login"}
                </Button>

                <div className="flex items-center my-2">
                  <hr className="flex-grow border-t border-gray-300" />
                  <span className="mx-2 text-sm text-gray-500">OR</span>
                  <hr className="flex-grow border-t border-gray-300" />
                </div>

                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => toast.error("Google Login Failed")}
                  theme="outline"
                  size="large"
                  width={350}
                  shape="pill"
                />

                <Button
                  variant="link"
                  className="text-sm text-blue-600 hover:underline mt-2 p-0 h-auto"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </Button>

                <p className="text-center text-sm">
                  Don't have an account?{" "}
                  <span
                    className="underline underline-offset-4 cursor-pointer"
                    onClick={() => setTab("signup")}
                  >
                    Signup
                  </span>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
