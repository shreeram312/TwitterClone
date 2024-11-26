import React, { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import InteractionCard from "./InteractionCard";
import { RiDeleteBin4Fill } from "react-icons/ri";
import { DeletePost } from "@/actions/action";
import toast from "react-hot-toast";

const FeedCard = ({
  postdata,
  comments,
  likes,
  postId,
  userId,
  onDelete,
  postImage,
}: any) => {
  const router = useRouter();

  const handleChangeRoute = useCallback(
    (id: any) => {
      router.push(`/home/${id}`);
    },
    [router]
  );

  async function handleDelete(e: any, userId, postId) {
    e.stopPropagation();

    const res = await DeletePost(userId, postId);
    console.log(res);
    if (res) {
      onDelete(postId);
      toast.success("Post Deleted Successfully");
    }
  }

  const renderContentWithHashtags = (text: string) => {
    const regex = /#\w+/g; // Match words starting with #
    const parts = text.split(regex); // Split the text by hashtags
    const hashtags = text.match(regex); // Get the hashtags themselves

    if (!hashtags) return text;

    return parts.map((part, index) => {
      if (hashtags[index]) {
        return (
          <span key={index}>
            <span className="text-blue-500">{hashtags[index]}</span>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      onClick={() => handleChangeRoute(postdata?.id)}
      className="grid grid-cols-12 border-b border-gray-700 p-4 transition duration-200 ease-in-out cursor-pointer"
    >
      <div className="col-span-2 sm:col-span-1">
        <Image
          className="rounded-full"
          src={postdata.user.profileImage}
          alt="userimage"
          width={50}
          height={50}
        />
      </div>

      <div className="col-span-10 sm:col-span-11 mx-2 my-2">
        <h5 className="font-bold text-cyan-200 text-sm">
          {postdata.user.userName}

          <RiDeleteBin4Fill
            style={{ height: "25px", width: "25px" }}
            className="float-end"
            onClick={(e) => handleDelete(e, userId, postId)}
          />
        </h5>

        <p className="text-lg sm:text-base break-words overflow-hidden py-3 font-medium">
          {renderContentWithHashtags(postdata.bodyContent)}
        </p>
        {postImage && (
          <Image
            className="-mx-6 sm:mx-2"
            src={postImage}
            height={450}
            width={450}
            alt="noimage"
          />
        )}
      </div>

      <div className="mx-12 p-2">
        <InteractionCard
          comments={comments}
          likes={likes}
          postdata={postdata}
          postId={postId}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default FeedCard;
