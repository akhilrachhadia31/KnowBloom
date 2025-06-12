import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  useLoadUserQuery,
  useUpdateUserMutation,
  useCheckPasswordMutation,
  useUpdatePasswordUserMutation,
} from "@/features/api/authApi";
import { toast } from "react-hot-toast";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [biography, setBiography] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [removeStatus, setRemoveStatus] = useState("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [updatePasswordUser] = useUpdatePasswordUserMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [fadeTransition, setFadeTransition] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [currentPasswordValid, setCurrentPasswordValid] = useState(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [checkPassword, { isLoading: isCheckingPassword }] =
    useCheckPasswordMutation();

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name.trim() || "");
      setEmail(data.user.email.trim() || "");
      setBiography(data.user.biography.trim() || "");
      setLinkedin(data.user.linkedin.trim() || "");
      setInstagram(data.user.instagram.trim() || "");
      setTwitter(data.user.twitter.trim() || "");
    }
  }, [data]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setRemoveStatus("idle");
    }
  };
 const Profile = () => {

  useEffect(() => {
    if (currentPassword) validateCurrentPassword();
    else setCurrentPasswordValid(null);
  }, [currentPassword]);

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      const response = await updatePasswordUser({
        currentPassword,
        newPassword,
      }).unwrap();
      toast.success(response.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordDialogOpen(false);
      refetch(); // Refresh user data
    } catch (error) {
      setPasswordError(
        error?.data?.message || error?.error || "Password update failed"
      );
    }
  };

  const updateUserHandler = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email cannot be empty.");
      return;
    }

    const nameChanged = name.trim() !== data?.user?.name;
    const emailChanged = email.trim() !== data?.user?.email;
    const photoChanged = profilePhoto || removeStatus === "removing";
    const newFieldsChanged =
      biography !== data?.user?.biography.trim() ||
      linkedin !== data?.user?.linkedin.trim() ||
      instagram !== data?.user?.instagram.trim() ||
      twitter !== data?.user?.twitter.trim();

    if (!nameChanged && !emailChanged && !photoChanged && !newFieldsChanged) {
      toast.info("No changes detected.");
      const Profile = () => {
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
                disabled={!currentPasswordValid}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500"
                disabled={!currentPasswordValid}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {isPasswordInvalid && (
              <p className="text-sm text-red-600">
                Incorrect current password.
              </p>
            )}
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            {/* Update button: right-aligned */}
            <div className="flex justify-end">
              <Button className="mt-4" onClick={handlePasswordChange}>
              <Button className="mt-4" onClick={() => setOtpDialogOpen(true)}>
                Update Password
              </Button>
            </div>

            <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter OTP</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Please enter the 6-digit code sent to your email to
                    confirm password change.
                  </p>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    placeholder="123456"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setOtpDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setOtpDialogOpen(false);
                      handlePasswordChange();
                      setOtp("");
                    }}
                    disabled={otp.trim().length < 6}
                  >
                    Verify OTP
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;