"use client";
import React, { FC, useEffect, useState } from "react";
import { styles } from "@/app/styles/style";
import { useUpdatePasswordMutation } from "@/redux/features/user/userApi";
import toast from "react-hot-toast";

type Props = {
  avatar?: string | null;
  user?: unknown;
};

const ChangePassword: FC<Props> = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatePassword, {isSuccess,error}] = useUpdatePasswordMutation();
  const passwordChangeHandler = async(e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if( newPassword !== confirmPassword){
        toast.error("Passwords do not match");
     }
     else{
        await updatePassword({oldPassword, newPassword});
     }
  };

  useEffect(() =>{
      if(isSuccess){
        toast.success("Password changed successfully");
        setTimeout(() => {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }, 0);
      }
      if(error){
        if("data" in error){
            const errorData = error as { data?: { message?: string } };
            toast.error(errorData?.data?.message || "Failed to update password");
        }
      }
  }, [isSuccess, error])

  
  return (
    <div className="w-full flex justify-center py-1 px-4">
      <form onSubmit={passwordChangeHandler} className="w-full flex flex-col items-center">
        <h1 className="text-[25px] text-black dark:text-white font-medium font-Poppins text-center py-2">
          Change Password
        </h1>

        <div className="w-full max-w-[500px] mt-1">
          <label className={styles.label} htmlFor="oldPassword">
            Old Password
          </label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            className={`${styles.input} w-full border-purple-400 focus:border-purple-600`}
            placeholder="Enter your old password"
          />
        </div>

        <div className="w-full max-w-[500px] mt-5">
          <label className={styles.label} htmlFor="newPassword">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={`${styles.input} w-full border-purple-400 focus:border-purple-600`}
            placeholder="Enter your new password"
          />
        </div>

        <div className="w-full max-w-[500px] mt-5">
          <label className={styles.label} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={`${styles.input} w-full border-purple-400 focus:border-purple-600`}
            placeholder="Enter your confirm password"
          />
        </div>

        <div className="w-full mt-8 flex justify-center">
          <button
            type="submit"
            className="w-44 h-11 rounded bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-Poppins font-semibold transition-all"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;