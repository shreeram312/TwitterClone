import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import BottomProfile from "./BottomProfile";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

interface UserInfoState {
  id: string;
  name?: string;
  userName?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  followingIds: string[];
  followersIds: string[];
}

export default function ProfileSection() {
  const [UserInfo, setUserInfo] = useState<UserInfoState>({
    id: "",
    name: "",
    userName: "",
    bio: "",
    profileImage: "",
    coverImage: "",
    followingIds: [],
    followersIds: [],
  });
  const [coverurl, setcoverurl] = useState("");
  const { getToken } = useAuth();
  const [updateprofileImage, setupdateprofileImage] = useState<string>("");
  const router = useRouter();

  console.log(UserInfo);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const fetchRes = async () => {
      const token = await getToken();
      if (!token) {
        console.error("No token available");
        return;
      }
      try {
        const res = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(res.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    //This can be solution but it is polling  and i dont like that solution to solve this problem maybe Websocket and sse can solve  🥲🥲
    // const id = setInterval(() => fetchRes(), 2000);
    // return () => {
    //   clearInterval(id);
    // };

    fetchRes();
  }, []);

  useEffect(() => {
    if (updateprofileImage) {
      const update = async () => {
        try {
          const res = await axios.patch("/api/user/profileImage", {
            userName: UserInfo.userName,
            profileImage: updateprofileImage,
          });
          console.log(res);
          setUserInfo((prev) => ({
            ...prev,
            profileImage: updateprofileImage,
          }));
        } catch (error) {
          console.error("Error updating profile image:", error);
        }
      };
      update();
    }
    // eslint-disable-next-line
  }, [updateprofileImage]);

  useEffect(() => {
    if (coverurl) {
      const updateCoverImage = async () => {
        try {
          await axios.patch("/api/user", {
            coverImage: coverurl,
            userName: UserInfo.userName,
          });
          setUserInfo((prev) => ({ ...prev, coverImage: coverurl }));
        } catch (error) {
          console.error("Error updating cover image:", error);
        }
      };
      updateCoverImage();
    }
    //   eslint-disable-next-line
  }, [coverurl, UserInfo.userName]);

  return (
    <div className="bg-black text-white min-h-screen p-2">
      <button
        onClick={handleBack}
        className="text-2xl mx-2 my-1 hover:rounded-full p-1  hover:bg-gray-900  "
      >
        <IoMdArrowRoundBack />
      </button>
      <div className="relative w-full h-48 bg-blue-900">
        <CldUploadWidget
          onSuccess={(results: any) => setcoverurl(results?.info?.url)}
          uploadPreset="shree-image"
        >
          {({ open }) => (
            <button
              className="absolute right-0 bg-black rounded-md p-1 my-1"
              onClick={() => open()}
            >
              Cover Image
            </button>
          )}
        </CldUploadWidget>
        <Image
          height={1040}
          width={1040}
          src={UserInfo.coverImage || ""}
          alt="Profile background"
          className="object-cover w-full h-full"
        />
        <div className="relative">
          <div className="absolute bottom-5 left-3 transform translate-y-1/2">
            <Image
              src={UserInfo.profileImage || ""}
              width={150}
              height={150}
              alt="Profile"
              className="rounded-full w-24 h-24 border-4 border-black"
            />
          </div>

          <div className="absolute bottom-0 left-20 transform translate-y-2/3 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer border-2 border-white">
            <CldUploadWidget
              onSuccess={(results: any) => {
                const transformedUrl = results.info.secure_url.replace(
                  "/upload/",
                  "/upload/c_fill,g_face,r_max,w_200,h_200/"
                );
                setupdateprofileImage(transformedUrl);
                setUserInfo((prev) => ({
                  ...prev,
                  profileImage: transformedUrl,
                }));
              }}
              uploadPreset="shree-image"
            >
              {({ open }) => (
                <span onClick={() => open()} className="text-lg font-bold my-4">
                  +
                </span>
              )}
            </CldUploadWidget>
          </div>
        </div>

        <div className="mt-12 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{UserInfo.name}</h1>
              <p className="text-gray-400">@{UserInfo.userName}</p>
            </div>
            <button className="bg-transparent border border-gray-500 px-3 py-1 rounded-full text-sm hover:bg-gray-800">
              Edit Profile
            </button>
          </div>

          <p className="mt-4">{UserInfo.bio}</p>
          <p className="mt-2 text-gray-400">CSE'25</p>

          <div className="mt-4 flex space-x-6">
            <div className="flex items-center">
              <span className="font-bold">
                {UserInfo?.followingIds?.length}
              </span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold">
                {UserInfo?.followersIds?.length}
              </span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
          </div>
        </div>
        <BottomProfile UserInfo={UserInfo} />
      </div>
    </div>
  );
}
