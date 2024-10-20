import React, { useEffect, useState, useRef } from "react";
import { FaImage, FaSmile, FaMapMarkerAlt } from "react-icons/fa";
import { BsCardImage, BsEmojiSmile, BsCalendarEvent } from "react-icons/bs";
import { IoMdGift } from "react-icons/io";
import { AiOutlineBars } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

interface PostBoxProps {
  userId: string;
  addPost: (newPost: any) => void;
  imageUrl: string;
}

const PostBox: React.FC<PostBoxProps> = ({ userId, addPost, imageUrl }) => {
  const [postContent, setPostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [postImage, setpostImage] = useState<string>("");

  const handlePost = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/user/post", {
        bodyContent: postContent,
        userId,
        postImage: postImage,
      });
      addPost(res.data);
      setpostImage("");
      toast.success("Post added successfully");
      setPostContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to add post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="w-full bg-black text-white p-4 rounded-lg shadow-md border border-gray-700">
      <div className="flex items-start">
        <Image
          src={imageUrl}
          width={50}
          height={50}
          alt="Profile"
          className="rounded-full w-10 h-10 mr-3"
        />

        <div className="w-full">
          {postImage && (
            <div>
              <Image
                src={postImage}
                height={450}
                width={450}
                alt="Post-image"
              />{" "}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={postContent}
            onChange={(e) => {
              setPostContent(e.target.value);
              handleResizeTextarea();
            }}
            placeholder="What is happening?!"
            className="h-auto w-full bg-black text-white p-2 border-b border-gray-600 focus:outline-none resize-none"
            rows={2} // Default rows
          />

          <div className="flex justify-between items-center mt-2">
            <div className="flex space-x-4 text-blue-400">
              <CldUploadWidget
                onSuccess={(results: any) => {
                  console.log(results);
                  setpostImage(results?.info?.url);
                }}
                uploadPreset="shree-image"
              >
                {({ open }) => (
                  <button
                    className="  bg-black rounded-md "
                    onClick={() => open()}
                  >
                    <BsCardImage
                      className="cursor-pointer  hover:text-blue-300 transition"
                      size={20}
                    />
                  </button>
                )}
              </CldUploadWidget>
              <IoMdGift
                className="cursor-pointer hover:text-blue-300 transition"
                size={20}
              />
              <AiOutlineBars
                className="cursor-pointer hover:text-blue-300 transition"
                size={20}
              />
              <FaSmile
                onClick={() => {}}
                className="cursor-pointer hover:text-blue-300 transition"
                size={20}
              />
              <BsCalendarEvent
                className="cursor-pointer hover:text-blue-300 transition"
                size={20}
              />
              <FaMapMarkerAlt
                className="cursor-pointer hover:text-blue-300 transition"
                size={20}
              />
            </div>

            <button
              onClick={handlePost}
              disabled={!postContent.trim() || loading}
              className={`bg-blue-500 text-white py-1 px-4 rounded-full ${
                !postContent.trim() || loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostBox;