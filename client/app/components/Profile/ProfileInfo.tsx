"use client";

import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
import { AiOutlineCamera } from "react-icons/ai";
import { styles } from "@/app/styles/style";
import avatarIcon from "../../../public/assests/avatar.png";
import {
  useEditProfileMutation,
  useUpdateAvatarMutation,
} from "@/redux/features/user/userApi";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import toast from "react-hot-toast";

interface UserType {
  name?: string;
  email?: string;
  role?: string;
  avatar?: {
    url?: string | null;
  } | null;
  courses?: unknown[];
}

type Props = {
  avatar: string | null;
  user: UserType;
};

const ProfileInfo: FC<Props> = ({ avatar, user }) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [localAvatar, setLocalAvatar] = useState<string | null>(
    avatar ||
    (typeof user?.avatar === "string"
      ? user.avatar
      : user?.avatar?.url || null)
  );

  const [updateAvatar, { isSuccess, error }] =
    useUpdateAvatarMutation();

  const [editProfile, { isSuccess: success, error: updateError }] =
    useEditProfileMutation();

  useLoadUserQuery(undefined, {
    skip: !(isSuccess || success),
  });

  const imageHandler = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const fileReader = new FileReader();

    fileReader.onload = () => {
      if (fileReader.readyState === 2) {
        const avatarData = fileReader.result as string;

        setLocalAvatar(avatarData);
        updateAvatar(avatarData);
      }
    };

    fileReader.readAsDataURL(file);
  };

  useEffect(() => {
    if (error || updateError) {
      console.log(error || updateError);
    }

    if (success) {
      toast.success("Profile updated successfully");
    }
  }, [error, updateError, success]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (name !== "") {
      await editProfile({
        name,
      });
    }
  };

  return (
    <div className="w-full flex justify-center py-1 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        {/* Avatar Section */}
        <div className="w-full flex justify-center">
          <div className="relative">
            <Image
              src={localAvatar || avatarIcon}
              alt="Profile Avatar"
              width={120}
              height={120}
              className="w-[150px] h-[150px] rounded-full border-[3px] border-[#8B5CF6] object-cover"
            />

            <input
              type="file"
              id="avatar"
              className="hidden"
              accept="image/png,image/jpg,image/jpeg,image/webp"
              onChange={imageHandler}
            />

            <label
              htmlFor="avatar"
              className="absolute bottom-1 right-1 z-10 h-8 w-8 rounded-full bg-[#8B5CF6] flex items-center justify-center cursor-pointer"
            >
              <AiOutlineCamera
                className="text-white"
                size={21}
              />
            </label>
          </div>
        </div>

        {/* Name */}
        <div className="w-full max-w-[500px] mt-1">
          <label
            className={styles.label}
            htmlFor="name"
          >
            Full Name
          </label>

          <input
            type="text"
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`${styles.input} w-full border-purple-400 focus:border-purple-600`}
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div className="w-full max-w-[500px] mt-5">
          <label
            className={styles.label}
            htmlFor="email"
          >
            Email Address
          </label>

          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${styles.input} w-full border-purple-400 focus:border-purple-600`}
            placeholder="Enter your email address"
          />
        </div>

        {/* Submit Button */}
        <div className="w-full mt-8 flex justify-center">
          <button
            type="submit"
            className="w-54 h-11 px-10 rounded bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-Poppins font-semibold transition-all"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;