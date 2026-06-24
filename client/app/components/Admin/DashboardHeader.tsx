"use client";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import socketIO from "socket.io-client";
import { format } from "date-fns";
import { IoMdNotificationsOutline } from "react-icons/io";

import { ThemeSwitcher } from "@/app/utils/ThemeSwitcher";
import {
  useGetAllNotificationsQuery,
  useUpdateNotificationStatusMutation,
} from "@/redux/features/notifications/notificationsApi";

type NotificationStatus = "read" | "unread" | string;

type NotificationItem = {
  _id: string;
  title?: string;
  message?: string;
  createdAt: string | Date;
  status: NotificationStatus;
};

type Props = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const DashboardHeader: FC<Props> = ({ open, setOpen }) => {
  const { data, refetch } = useGetAllNotificationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateNotificationStatus, { isSuccess }] =
    useUpdateNotificationStatusMutation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [audioReady, setAudioReady] = useState(false);

  const unreadNotifications = useMemo(() => {
    const raw = (data?.notifications ?? []) as NotificationItem[];
    return raw.filter((item) => item.status === "unread");
  }, [data?.notifications]);

  // Load audio once (no state updates inside effect body beyond boolean flag)
  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio("/assets/notification-sound.mp3");
    audio.load();
    setAudioReady(true);
  }, []);

  const playerNotificationSound = useCallback(() => {
    if (!audioReady) return;
    const audio = new Audio("/assets/notification-sound.mp3");
    audio
      .play()
      .then(() => console.log("Audio playback started successfully."))
      .catch((error) => console.error("Audio playback failed:", error));
  }, [audioReady]);

  useEffect(() => {
    setNotifications(unreadNotifications);
  }, [unreadNotifications]);

  useEffect(() => {
    if (!isSuccess) return;
    refetch();
  }, [isSuccess, refetch]);

  useEffect(() => {
    const handler = () => {
      refetch();
      playerNotificationSound();
    };

    socketId.on("newNotification", handler);
    return () => {
      socketId.off("newNotification", handler);
    };
  }, [playerNotificationSound, refetch]);

  const handleNotificationStatusChange = async (id: string) => {
    await updateNotificationStatus(id);
  };

  return (
    <div className="w-full flex items-center justify-end p-4 800px:p-6 fixed top-0 800px:top-5 right-0 z-[9999999]">
      <ThemeSwitcher />

      <div
        className="relative cursor-pointer m-2"
        onClick={() => setOpen?.(!open)}
      >
        <IoMdNotificationsOutline className="text-[25px] 800px:text-[30px] cursor-pointer dark:text-white text-black" />
        <span className="absolute -top-2 -right-2 bg-[#9333ea] rounded-full w-[18px] h-[18px] 800px:w-[20px] 800px:h-[20px] text-[10px] 800px:text-[12px] flex items-center justify-center text-white">
          {notifications.length}
        </span>
      </div>

      {open && (
        <div className="w-[200px] 800px:w-[350px] h-[50vh] 800px:h-[60vh] overflow-y-auto py-3 px-2 border border-[#ffffff0c] dark:bg-[#111C43] bg-white shadow-2xl absolute top-16 right-2 800px:right-0 z-[10000000] rounded-lg">
          <h5 className="text-center text-[18px] 800px:text-[20px] font-Poppins font-[600] text-black dark:text-white p-3">
            Notifications
          </h5>
          <hr className="dark:border-[#ffffff1a] border-[#0000001a] mb-2" />

          {notifications.length > 0 ? (
            notifications.map((item, index) => (
              <div
                className="dark:bg-[#2d3a4e] bg-[#0000000a] font-Poppins border-b dark:border-b-[#ffffff1a] border-b-[#0000000f] mb-2 rounded-md transition-all"
                key={item._id ?? index}
              >
                <div className="w-full flex items-center justify-between p-2">
                  <p className="text-black dark:text-white text-[14px] 800px:text-[16px] font-[500]">
                    {item.title}
                  </p>
                  <p
                    className="text-[#9333ea] dark:text-[#c084fc] text-[12px] 800px:text-[14px] cursor-pointer hover:underline"
                    onClick={() => handleNotificationStatusChange(item._id)}
                  >
                    Mark as read
                  </p>
                </div>
                <p className="px-2 text-black dark:text-white text-[13px] 800px:text-[15px] opacity-80">
                  {item.message}
                </p>
                <p className="p-2 text-gray-500 dark:text-[#ffffff80] text-[11px] 800px:text-[12px]">
                  {format(new Date(item.createdAt), "PPp")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center py-10 dark:text-white text-black opacity-60">
              No new notifications
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;

