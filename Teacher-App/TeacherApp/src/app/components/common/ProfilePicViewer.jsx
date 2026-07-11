import { useEffect, useState } from "react";
import { getImageUrl } from "../../../api/services/fileService";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "./LoadingSpinner";
const DEFAULT_AVATAR = "/assets/avatars/profile_Blank_Image.jpeg";
export const ProfilePicViewer = ({
  fileId = null,
  filePath = null,
  className,
  module = null,
  size = 8,
}) => {
  // if (module) {

  // }
  const [imageSrc, setImageSrc] = useState("");
  //   const [imageLoading, setImageLoading] = useState;
  const useImageUrl = (download = false) => {
    return useQuery({
      queryKey: [fileId ? fileId : filePath, [fileId, filePath], download],
      queryFn: () => getImageUrl(fileId, download, filePath),
      enabled: !!fileId || !!filePath, // Only run if fileId is present
      staleTime: 0, // always stale, triggers refetch
      cacheTime: 0, // do not keep in cache at all
      refetchOnMount: true,
    });
  };

  const { data: imageUrl, isLoading: profileLoading, error } = useImageUrl();

  //   if (isLoading) return <p>Loading image...</p>;
  //   if (error) return <p>Error loading image</p>;
  //   useEffect(async () => {
  //     if (fileId) {
  //       const imageUrl = await getImageUrl(fileId);
  //       if (imageUrl) {
  //         setImageSrc(imageUrl);
  //       }
  //     }
  //   }, [fileId]);
  return (
    <div className={`h-${size} w-${size} rounded-full border border-gray-300`}>
      {error || (!fileId && !filePath) || !imageUrl ? (
        <img
          src={DEFAULT_AVATAR}
          alt="Profile"
          className={`h-${size} w-${size} rounded-full object-cover`}
        />
      ) : profileLoading ? (
        <LoadingSpinner fullHeight={false} size={8} color={"white"} />
      ) : (
        <img
          src={imageUrl}
          alt="Profile"
          className={`h-${size} w-${size} rounded-full object-cover`}
        />
      )}
    </div>
  );
};
