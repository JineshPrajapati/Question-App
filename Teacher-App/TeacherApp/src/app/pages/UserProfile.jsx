import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../components/form/FormElements";
import { PencilIcon } from "@heroicons/react/24/outline";
import {
  getUserDetailById,
  updateUserProfile,
} from "../../api/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { updateProfilePicture } from "../../api/services/userService";
import { getImageUrl } from "../../api/services/fileService";
import { ProfilePic } from "../components/common/ProfilePic";
import { toast } from "react-toastify";
import { isImageLoadable } from "../../lib/utility";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
//import { Tooltip } from "../../components/common/Tooltip";
import { Tooltip } from "../components/common/Tooltip";
import * as Yup from "yup";
import { BaseForm } from "../components/common/BaseForm";
import imageCompression from "browser-image-compression";
import { ProfilePicViewer } from "../components/common/ProfilePicViewer";
import FileResizer from "react-image-file-resizer";
import {
  keyPressOnlyAlphabets,
  keyPressZipCode,
  keyPressAddress,
  keyPressOnlyAlphabetsWithSpace,
  userProfileValidationSchema,
} from "../components/form/validationSchema";

export const UserProfile = ({ userId, onSuccess, onClose, isEdit = true }) => {
  const [activeTab, setActiveTab] = useState("Profile");
  const {
    user: userSessionData,
    UserProfilePic,
    setProfilePicPersist,
  } = useContext(AuthContext);
  const [imageLoading, setImageLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    dateofBirth: "",
    gender: "",
    address: "",
    // city: "",
    // state: "",
    // pincode: "",
    // country: "",
    contactNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Profile update failed");
    },
  });
  const user = {
    avatar: "/assets/avatars/150-2.jpg",
  };

  const DEFAULT_AVATAR = "/assets/avatars/profile_Blank_Image.jpeg";

  // const [imageSrc, setImageSrc] = useState(
  //   userSessionData.profilePicturePath.replace(/\\/g, "/") || DEFAULT_AVATAR,
  // );
  const [imageSrc, setImageSrc] = useState(UserProfilePic || DEFAULT_AVATAR);

  const genderType = [
    { id: "M", label: "Male" },
    { id: "F", label: "Female" },
    { id: "O", label: "Other" },
  ];
  const updateProfilePictureMutation = useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: (data) => {
      toast.success("Profile picture updated successfully");
      fetchUserImage();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile picture");
      setImageSrc(DEFAULT_AVATAR);
    },
  });

  useEffect(() => {
    const LoadUserImage = async () => {
      if (UserProfilePic) {
        const imageData = await isImageLoadable(UserProfilePic);
        if (imageData) {
          setImageLoading(false);
          setImageSrc(UserProfilePic);
        } else {
          setTimeout(() => {
            setImageLoading(false);
          }, [10000]);
        }
      } else {
        setImageLoading(false);
        setImageSrc(DEFAULT_AVATAR);
      }
    };

    LoadUserImage();
  }, UserProfilePic);

  const fetchUserImage = async () => {
    if (userSessionData?.fileIdentityId) {
      const imageUrl = await getImageUrl(userSessionData.fileIdentityId);
      if (imageUrl) {
        setImageSrc(imageUrl);
        setProfilePicPersist(imageUrl);
      }
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 300,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.6,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

      // Get extension from base64 string
      const { extension } = getImageTypeFromBase64(base64) || {};

      const payload = {
        userId: userData.userId,
        imagePath: "string",
        isResident: false,
        imageName: userData.userId + userData.firstName,
        base64Image: base64.split(",")[1], // remove data prefix
        imageExtension: extension,
      };

      await updateProfilePictureMutation.mutateAsync(payload);
      setImageSrc(base64);
      refetch();
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const getImageTypeFromBase64 = (base64String) => {
    const match = base64String.match(/^data:(image\/[a-zA-Z]+);base64,/);
    if (!match) return null;

    const mimeType = match[1]; // e.g. image/webp
    const extension = mimeType.split("/")[1]; // e.g. webp
    return { extension };
  };

  const {
    data: userDetails,
    isLoading: userLoading,
    refetch,
  } = useQuery({
    queryKey: ["userData", userSessionData?.userId],
    queryFn: () => getUserDetailById(userSessionData.userId),
    enabled: !!userSessionData?.userId,
  });

  useEffect(() => {
    if (userDetails?.data) {
      setUserData(userDetails.data);
    }
  }, [userDetails]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (userLoading || !userData?.firstName) {
    return <LoadingSpinner />;
  }

  const initialValues = {
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    emailAddress: userData.emailAddress || "",
    type: userData.userType || "", // required by Yup
    // dateOfBirth: userData?.dateofBirth
    //   ? new Date(userData.dateofBirth).toISOString().split("T")[0]
    //   : "",
    gender: userData?.gender || "",
    // address: userData?.address || "",
    // city: userData?.city || "",
    // state: userData?.state || "",
    // pincode: userData?.pincode || "",
    // country: userData?.country || "",
    //phoneNumber: userData?.phoneNumber || "",
    //emergencyContactName: userData?.emergencyContactName || "",
    //emergencyContactPhone: userData?.emergencyContactPhone || "",
  };
  const handleSubmit = async (values) => {
    const userId = userData?.userId || userSessionData?.userId;
    if (!userId) {
      console.error("User ID is missing!");
      return;
    }

    try {
      await updateUserProfile({ ...values, userId });
      toast.success("Profile updated successfully");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };
  return (
    <div className="max-h-full overflow-y-auto">
      <div className="min-h-screen bg-gray-100 px-4 py-10 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="relative rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="absolute top-4 right-4">
              <Tooltip content="Edit Profile Picture">
                <button
                  className="bg-primary hover:bg-primary-dark rounded-full p-2 text-white transition"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>

            {imageLoading ? (
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-gray-300">
                <LoadingSpinner fullHeight={false} />
              </div>
            ) : (
              <div className="mx-auto h-32 w-32">
                <ProfilePic
                  src={imageSrc}
                  alt="Profile"
                  onError={() => setImageSrc(DEFAULT_AVATAR)}
                  className="border-primary h-full w-full rounded-full border-4 object-cover shadow-md"
                />
                {/* <ProfilePicViewer
                  size={24}
                  fileId={userSessionData.fileIdentityId || null}
                  className={"z-0"}
                /> */}
              </div>
            )}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-sm text-gray-500">{userSessionData?.roleName}</p>
            {/* <p className="mt-2 text-sm text-gray-400 italic">
              {userData.userType || "User"}
            </p> */}
            {/*<div className="mt-4">*/}
            {/*  <span className="text-xs text-gray-400">User Code:</span>*/}
            {/*  <p className="text-md font-medium text-gray-700">*/}
            {/*    {userData.userCode || "-"}*/}
            {/*  </p>*/}
            {/*</div>*/}
          </div>

          {/* Form Card */}
          <div className="rounded-3xl bg-white p-8 shadow-xl lg:col-span-2">
            <h3 className="mb-6 border-b pb-3 text-2xl font-bold text-gray-800">
              Edit Profile
            </h3>

            <BaseForm
              key={userData?.userId} // force remount when data loads
              initialValues={initialValues}
              validationSchema={userProfileValidationSchema}
              onSubmit={(values) => {
                handleSubmit(values);
              }}
              onSuccess={onSuccess}
              onClose={onClose}
              submitButtonText="Update Profile"
              showSubmitButton={false}
              className="p-0 pb-0"
            >
              {(formik) => (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <FormLabel htmlFor="firstName">First Name</FormLabel>
                      <FormInput
                        id="firstName"
                        name="firstName"
                        {...formik.getFieldProps("firstName")}
                        onKeyPress={keyPressOnlyAlphabets}
                      />
                      {formik.touched.firstName && formik.errors.firstName && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.firstName}
                        </div>
                      )}
                    </div>
                    <div>
                      <FormLabel htmlFor="lastName">Last Name</FormLabel>
                      <FormInput
                        id="lastName"
                        name="lastName"
                        {...formik.getFieldProps("lastName")}
                        onKeyPress={keyPressOnlyAlphabets}
                      />
                      {formik.touched.lastName && formik.errors.lastName && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.lastName}
                        </div>
                      )}
                    </div>
                    <div>
                      <FormLabel htmlFor="emailAddress">Email</FormLabel>
                      <FormInput
                        disabled={isEdit}
                        id="emailAddress"
                        type="email"
                        name="emailAddress"
                        {...formik.getFieldProps("emailAddress")}
                      />
                      {formik.touched.emailAddress &&
                        formik.errors.emailAddress && (
                          <div className="mt-1 text-left text-sm text-red-500">
                            {formik.errors.emailAddress}
                          </div>
                        )}
                    </div>
                    {/* <div>
                      <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                      <FormInput
                        id="dateOfBirth"
                        type="date"
                        name="dateOfBirth"
                        {...formik.getFieldProps("dateOfBirth")}
                        placeholder="MM-DD-YYYY"
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {formik.touched.dateOfBirth &&
                        formik.errors.dateOfBirth && (
                          <div className="mt-1 text-left text-sm text-red-500">
                            {formik.errors.dateOfBirth}
                          </div>
                        )}
                    </div> */}
                    <div>
                      <FormLabel htmlFor="gender">Gender</FormLabel>
                      <FormSelect
                        id="gender"
                        name="gender"
                        valueKey="id"
                        labelKey="label"
                        options={[
                          { id: "", label: "Choose an option" },
                          ...genderType,
                        ]}
                        {...formik.getFieldProps("gender")}
                      />
                      {formik.touched.gender && formik.errors.gender && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.gender}
                        </div>
                      )}
                    </div>
                    {/* <div>
                      <FormLabel htmlFor="address">Address</FormLabel>
                      <FormInput
                        id="address"
                        name="address"
                        {...formik.getFieldProps("address")}
                        onKeyPress={keyPressAddress}
                      />
                      {formik.touched.address && formik.errors.address && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.address}
                        </div>
                      )}
                    </div> */}
                    {/* <div>
                      <FormLabel htmlFor="city">City</FormLabel>
                      <FormInput
                        id="city"
                        name="city"
                        {...formik.getFieldProps("city")}
                        onKeyPress={keyPressOnlyAlphabetsWithSpace}
                      />
                      {formik.touched.city && formik.errors.city && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.city}
                        </div>
                      )}
                    </div>
                    <div>
                      <FormLabel htmlFor="state">State</FormLabel>
                      <FormInput
                        id="state"
                        name="state"
                        {...formik.getFieldProps("state")}
                        onKeyPress={keyPressOnlyAlphabetsWithSpace}
                      />
                      {formik.touched.state && formik.errors.state && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.state}
                        </div>
                      )}
                    </div>
                    <div>
                      <FormLabel htmlFor="pincode">Zipcode</FormLabel>
                      <FormInput
                        id="pincode"
                        name="pincode"
                        {...formik.getFieldProps("pincode")}
                        onKeyPress={keyPressZipCode}
                      />
                      {formik.touched.pincode && formik.errors.pincode && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.pincode}
                        </div>
                      )}
                    </div>
                    <div>
                      <FormLabel htmlFor="country">Country</FormLabel>
                      <FormInput
                        id="country"
                        name="country"
                        {...formik.getFieldProps("country")}
                        onKeyPress={keyPressOnlyAlphabetsWithSpace}
                      />
                      {formik.touched.country && formik.errors.country && (
                        <div className="mt-1 text-left text-sm text-red-500">
                          {formik.errors.country}
                        </div>
                      )}
                    </div> */}
                    {/* <div>
                      <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
                      <FormInput
                        id="phoneNumber"
                        name="phoneNumber"
                        {...formik.getFieldProps("phoneNumber")}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          formik.setFieldValue("phoneNumber", val);
                        }}
                      />
                      {formik.touched.phoneNumber &&
                        formik.errors.phoneNumber && (
                          <div className="mt-1 text-left text-sm text-red-500">
                            {formik.errors.phoneNumber}
                          </div>
                        )}
                    </div> */}
                    {/* <div>
                      <FormLabel htmlFor="emergencyContactName">
                        Emergency Contact Name
                      </FormLabel>
                      <FormInput
                        id="emergencyContactName"
                        name="emergencyContactName"
                        {...formik.getFieldProps("emergencyContactName")}
                        onKeyPress={keyPressOnlyAlphabetsWithSpace}
                      />
                      {formik.touched.emergencyContactName &&
                        formik.errors.emergencyContactName && (
                          <div className="mt-1 text-left text-sm text-red-500">
                            {formik.errors.emergencyContactName}
                          </div>
                        )}
                    </div>
                    <div>
                      <FormLabel htmlFor="emergencyContactPhone">
                        Emergency Contact Number
                      </FormLabel>
                      <FormInput
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        {...formik.getFieldProps("emergencyContactPhone")}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          formik.setFieldValue("emergencyContactPhone", val);
                        }}
                      />
                      {formik.touched.emergencyContactPhone &&
                        formik.errors.emergencyContactPhone && (
                          <div className="mt-1 text-left text-sm text-red-500">
                            {formik.errors.emergencyContactPhone}
                          </div>
                        )}
                    </div> */}
                  </div>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary rounded px-4 py-2 text-white shadow"
                  >
                    Update Profile
                  </button>
                </>
              )}
            </BaseForm>
          </div>
        </div>
      </div>
    </div>
  );
};
