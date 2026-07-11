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
import { manageCurriculum } from "../../../api/services/curriculumService";
import { toast } from "react-toastify";
import { AuthContext } from "../../../contexts/authContext";
import {
  getSchoolGradeList,
  getSubjectDropdown,
} from "../../../api/services/dropDownMasterService";
const lessonPlanningSchema = Yup.object().shape({
  grade: Yup.string().required("Grade is required"),
  subject: Yup.string().required("Subject is required"),
  base64File: Yup.string().when("fileUrl", {
    is: (fileName) => !fileName,
    then: Yup.string().required("File upload is required"),
  }),
});

export const ManageCurriculumForm = ({ onSuccess, onClose, curriculum }) => {
  const {
    user: userData,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const [fileTypes, setFileTypes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () =>
      getDropdownData(`${dropdownConst.FILE_TYPE},${dropdownConst.USER_TYPE}`),
  });
  const { data: gradeData, isLoading: gradeLoading } = useQuery({
    queryKey: ["gradeData", userData.userId],
    queryFn: () =>
      getSchoolGradeList(
        userData.userId,
        currSelectedSchool,
        currSelectedAcademicYear,
      ),
  });

  const { data: subjectData, isLoading: subjectLoading } = useQuery({
    queryKey: ["subjectData", userData.userId],
    queryFn: () => getSubjectDropdown(userData.userId, currSelectedSchool),
  });

  useEffect(() => {
    if (
      dropdownData?.isSuccess &&
      gradeData?.isSuccess &&
      subjectData?.isSuccess
    ) {
      setFileTypes(
        dropdownData.options.filter(
          (option) => option.optionGroup === dropdownConst.FILE_TYPE,
        ),
      );

      const grades = Array.isArray(gradeData.data?.data)
        ? gradeData.data.data.map((grade) => ({
            gradeId: grade.value,
            grade: grade.label,
          }))
        : [];

      const subjects = Array.isArray(subjectData.data?.data)
        ? subjectData.data.data.map((subject) => ({
            subjectId: subject.value,
            subject: subject.label,
          }))
        : [];

      setGrades(grades);
      // console.log(subjects);
      setSubjects(subjects);
    }
  }, [dropdownData, gradeData, subjectData]);

  const mutation = useMutation({
    mutationFn: manageCurriculum,
    onSuccess: (data) => {
      toast.success(
        curriculum
          ? "Lesson Plan updated successfully"
          : "Lesson Plan added successfully",
      );
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          (curriculum
            ? "Lesson Plan update failed"
            : "Lesson Plan creation failed"),
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      fileCount: 0,
      fileContentType: "Curriculum",
      gradeId: curriculum?.gradeId || "",
      subjectId: curriculum?.subjectId || "",
      fileName: curriculum?.fileName || "",
      fileUrl: curriculum?.storePath || "",
      schoolId: curriculum?.schoolId || currSelectedSchool,
      CreatedIdentityBy: userData?.userId || "",
      lessonPlanFileId: curriculum?.lessonPlanFileId || 0,
      storePath: curriculum?.storePath || "",
      fileType: curriculum?.fileType || "",
      academicYearId: curriculum?.academicYearId || currSelectedAcademicYear,
    },
    lessonPlanningSchema,
    onSubmit: async (values) => {
      try {
        await mutation.mutateAsync(values);
      } catch (error) {}
    },
  });

  const handleGradeChange = (newValue) => {
    formik.setFieldValue("gradeId", newValue);
  };

  const handleFileChange = (event) => {
    formik.setFieldValue("fileCount", 0);
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
      formik.setFieldValue("fileCount", 1);
      formik.setFieldValue("base64File", base64String);
      formik.setFieldValue("fileName", file.name);
      formik.setFieldValue("fileType", matchedFileType.optionValue);
      formik.setFieldValue("userId", userData?.userId);
      formik.setFieldValue("fileContentType", "Curriculum");
      //formik.setFieldValue("subjectId", formik.values.subjectId);
      //formik.setFieldValue("gradeId", formik.values.gradeId);
    };
    reader.onerror = (error) => {
      console.error("Error converting file:", error);
      formik.setFieldValue("FileCount", 0);
      formik.setFieldError("base64File", "Error processing file.");
    };
  };

  if ((gradeLoading, subjectLoading)) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="h-full space-y-4 overflow-auto p-4 pb-16"
      >
        <div>
          <FormLabel htmlFor="grade">Grade</FormLabel>
          <FormSelect
            id="gradeId"
            name="gradeId"
            valueKey="gradeId"
            labelKey="grade"
            onChange={handleGradeChange}
            options={[{ gradeId: "", grade: "Choose an option" }, ...grades]}
            {...formik.getFieldProps("gradeId")}
          />
          {formik.touched.grade && formik.errors.grade && (
            <FormError className="text-left text-sm text-red-500">
              {formik.errors.grade}
            </FormError>
          )}
        </div>

        <div>
          <FormLabel htmlFor="subject">Subject</FormLabel>
          <FormSelect
            id="subjectId"
            name="subjectId"
            valueKey="subjectId"
            labelKey="subject"
            options={[
              { subjectId: "", subject: "Choose an option" },
              ...subjects,
            ]}
            {...formik.getFieldProps("subjectId")}
          />
          {formik.touched.subject && formik.errors.subject && (
            <FormError className="text-left text-sm text-red-500">
              {formik.errors.subject}
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
            disabled={
              mutation.isPending ||
              !formik.isValid ||
              !(formik.values.fileCount > 0)
            }
          >
            {curriculum ? "Update Lesson Plan" : "Create Lesson Plan"}
          </PrimaryButton>
        </div>
      </form>
    </>
  );
};
