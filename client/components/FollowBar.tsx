import { FollowingUser, GetAllUsers } from "@/actions/action";
import { useAppContext } from "@/context";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const FollowBar = ({ UserData, followStatus, setFollowStatus }: any) => {
  const { allUsers, setAllUsers } = useAppContext();
  const router = useRouter();
  console.log(UserData?.id);
  function handleClick(user) {
    router.push(`/profile/${user?.id}`);
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const cachedUsers = localStorage.getItem("alluser");
      localStorage.removeItem("alluser");
      if (!cachedUsers) {
        const res = await GetAllUsers(UserData?.id);
        localStorage.setItem("alluser", JSON.stringify(res));
        setAllUsers(res.filter((user: any) => user.id !== UserData?.id));
      } else {
        const users = JSON.parse(cachedUsers);
        setAllUsers(users.filter((user: any) => user.id !== UserData?.id));
      }

      if (UserData?.followingIds) {
        const initialFollowStatus = UserData.followingIds.reduce(
          (acc: any, id: string) => {
            acc[id] = true;
            return acc;
          },
          {}
        );
        setFollowStatus(initialFollowStatus);
        localStorage.setItem(
          "followStatus",
          JSON.stringify(initialFollowStatus)
        );
      } else {
        const storedFollowStatus = localStorage.getItem("followStatus");
        if (storedFollowStatus) {
          setFollowStatus(JSON.parse(storedFollowStatus));
        }
      }
    };

    fetchUsers();
  }, [UserData?.followingIds?.length]);

  useEffect(() => {
    localStorage.setItem("followStatus", JSON.stringify(followStatus));
  }, [followStatus]);

  const handleFollow = async (toUserId: string) => {
    const res = await FollowingUser(UserData?.id, toUserId);
    toast.success(
      followStatus && followStatus[toUserId]
        ? "Unfollowed Successfully"
        : "Followed Successfully"
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (res?.followingIds) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const newFollowStatus = res.followingIds.reduce(
        (acc: any, id: string) => {
          acc[id] = true;
          return acc;
        },
        {}
      );

      setFollowStatus(newFollowStatus);
      localStorage.setItem("followStatus", JSON.stringify(newFollowStatus));
    }

    //
    setAllUsers((prevUsers: any) =>
      prevUsers.map((user: any) => ({
        ...user,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        isFollowing: res?.followingIds.includes(user.id),
      }))
    );
  };

  return (
    <div className="sm:flex flex-col  hidden gap-10  sm:-mx-1 cursor-pointer">
      <div className="w-80 my-6 outline outline-offset-1 outline-1 outline-gray-600 rounded-lg">
        <div className="bg-black text-white p-4 overflow-hidden">
          <p className="text-semibold mx-2">Whom to Follow</p>
          <div
            className="max-h-40 cursor-pointer overflow-y-auto no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {allUsers.map((user: any, index: number) => (
              <div
                key={index}
                className="my-2 flex items-center justify-between bg-gray-900 p-2 rounded-md"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    onClick={() => handleClick(user)}
                    height={200}
                    width={200}
                    src={user?.profileImage}
                    alt={`${user?.userName}'s Profile`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="text-white font-medium">
                    {user?.userName}
                  </span>
                </div>
                <button
                  onClick={() => handleFollow(user?.id)}
                  className={`px-4 py-1 rounded-full transition duration-300 ${
                    followStatus[user?.id] ? "bg-gray-600" : "bg-blue-500"
                  } text-white`}
                >
                  {followStatus[user?.id] ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FollowBar;
