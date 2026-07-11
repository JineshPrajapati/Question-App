import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import {
  FormLabel,
  FormInput,
  FormError,
  FileUpload,
  FormSelect,
} from "../form/FormElements";
import { getDropdownData } from "../../../api/services/utilityService";
import { dropdownConst } from "../../../lib/dropdownConst";
import { PrimaryButton } from "../form/FormElements";
import { useFormik } from "formik";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ManageKnowledgebase } from "../../../api/services/knowledgebaseService";
import { toast } from "react-toastify";
import { AuthContext } from "../../../contexts/authContext";
const knowledgebaseSchema = Yup.object().shape({
  // grade: Yup.string().required("Grade is required"),
  heading: Yup.string().required("File heading is required"),
  base64File: Yup.string().when("fileUrl", {
    is: (fileName) => !fileName,
    then: Yup.string().required("File upload is required"),
  }),
});

export const KnowledgebaseForm = ({ onSuccess, onClose, knowledgebase }) => {
  const {
    user: userData,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const [fileTypes, setFileTypes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [grades, setGrades] = useState([]);
  const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () =>
      getDropdownData(`${dropdownConst.FILE_TYPE},${dropdownConst.USER_TYPE}`),
  });

  useEffect(() => {
    // Check if all data is loaded
    if (dropdownData?.isSuccess) {
      setFileTypes(
        dropdownData.options.filter(
          (option) => option.optionGroup === dropdownConst.FILE_TYPE,
        ),
      );
    }
  }, [dropdownData]);

  const mutation = useMutation({
    mutationFn: ManageKnowledgebase,
    onSuccess: (data) => {
      toast.success(
        knowledgebase
          ? "Knowledgebase updated successfully"
          : "Knowledgebase added successfully",
      );
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          (knowledgebase
            ? "Knowledgebase update failed"
            : "Knowledgebase creation failed"),
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      knowledgebaseCode: knowledgebase?.knowledgebaseCode || "",
      // grade: knowledgebase?.grade || "",
      heading: knowledgebase?.heading || "",
      academicYearId: parseInt(currSelectedAcademicYear),
      fileName: knowledgebase?.fileName || "",
      fileUrl: knowledgebase?.storePath || "",
      schoolId: knowledgebase?.schoolId || currSelectedSchool,
      CreatedIdentityBy: userData?.userId || "",
      isActive: knowledgebase?.isActive ?? true,
      knowledgebaseId: knowledgebase?.knowledgebaseId || 0,
      storePath: knowledgebase?.storePath || "",
      fileType: knowledgebase?.fileType || "",
    },
    knowledgebaseSchema,
    onSubmit: async (values) => {
      try {
        await mutation.mutateAsync(values);
      } catch (error) {}
    },
  });
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;
    const fileExtension = file.name.split(".").pop().toLowerCase();
    // Find the matching file type from dropdown
    const matchedFileType = fileTypes.find(
      (type) => type.optionLabel.toLowerCase() === fileExtension,
    );

    if (!matchedFileType) {
      formik.setFieldError(
        "base64File",
        "Invalid file type. Allowed: " +
          fileTypes.map((t) => t.optionValue).join(", "),
      );
      return;
    }
    setSelectedFile(file?.name || "No file chosen");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];

      formik.setFieldValue("base64File", base64String);
      formik.setFieldValue("fileName", file.name);
      formik.setFieldValue("fileType", matchedFileType.optionValue);
    };
    reader.onerror = (error) => {
      console.error("Error converting file:", error);
      formik.setFieldError("base64File", "Error processing file.");
    };
  };

  // if (gradeLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="h-full space-y-4 overflow-auto p-4 pb-16"
      >
        {/* <div>
          <FormLabel htmlFor="grade">Grade</FormLabel>
          <FormSelect
            id="grade"
            name="grade"
            valueKey="gradeId"
            labelKey="grade"
            options={[{ gradeId: "", grade: "Choose an option" }, ...grades]}
            {...formik.getFieldProps("grade")}
          />
          {formik.touched.grade && formik.errors.grade && (
            <FormError className="text-left text-sm text-red-500">
              {formik.errors.grade}
            </FormError>
          )}
        </div> */}

        <div>
          <FormLabel htmlFor="heading">Heading</FormLabel>
          <FormInput
            id="heading"
            name="heading"
            {...formik.getFieldProps("heading")}
          />
          {formik.touched.heading && formik.errors.heading && (
            <FormError className="text-left text-sm text-red-500">
              {formik.errors.heading}
            </FormError>
          )}
        </div>

        <div>
          <FormLabel htmlFor="file">Upload File</FormLabel>
          <div className="relative flex cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3 hover:bg-gray-100">
            <span className="truncate text-sm text-gray-800">
              {selectedFile}
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="text-primary text-sm font-medium">Browse</span>
          </div>
          {formik.errors.base64File && formik.touched.base64File && (
            <p className="text-red-500">{formik.errors.base64File}</p>
          )}
        </div>

        {formik.values.storePath && (
          <div className="text-left text-sm">
            <span className="font-medium text-gray-700">Current File:</span>{" "}
            <span className="font-medium text-gray-700">
              {" "}
              {formik.values.fileName}
            </span>{" "}
          </div>
        )}
        <div className="absolute bottom-0 left-0 flex w-full justify-center py-2 pr-8 pl-4">
          <PrimaryButton
            type="submit"
            loading={mutation.isPending}
            // disabled={
            //   mutation.isPending ||
            //   !formik.isValid ||
            //   (knowledgebase
            //     ? !formik.dirty
            //     : !formik.values.base64File || !formik.values.group)
            // }
            disabled={
              mutation.isPending ||
              !formik.isValid ||
              (!knowledgebase && !formik.values.base64File)
            }
          >
            {knowledgebase ? "Update knowledgebase" : "Create knowledgebase"}
          </PrimaryButton>
        </div>
      </form>
    </>
  );
};
