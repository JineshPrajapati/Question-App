import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../form/FormElements";
import { BaseForm } from "../common/BaseForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getDropdownData } from "../../../api/services/utilityService";
import { dropdownConst } from "../../../lib/dropdownConst";
import {
  addTeacher,
  updateTeacher,
} from "../../../api/services/teacherService";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";

const studentSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  dateOfBirth: Yup.date()
    .transform((value, originalValue) => {
      if (originalValue) {
        const date = new Date(originalValue);
        return isNaN(date) ? undefined : date;
      }
      return undefined;
    })
    .typeError("Please enter a valid date in MM-DD-YYYY format")
    .required("Date of Birth is required"),
  gender: Yup.string().required("Gender is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, "Must be at least 10 digits")
    .required("Contact Number is required"),
  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string().required("Zipcode is required"),
  emergencyContactName: Yup.string().required(
    "Emergency Contact Name is required",
  ),
  relationship: Yup.string().required("Relationship is required"),
  emergencyContactPhone: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, "Must be at least 10 digits")
    .required("Emergency Contact Number is required"),
  nationality: Yup.string().required("Nationality is required"),
});

export const TeacherForm = ({
  teacher,
  onSubmit,
  isSubmitting,
  onClose,
  onSuccess,
  isEdit = false,
}) => {
  const { user: currentUser } = useContext(AuthContext);
  const [isDataReady, setIsDataReady] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);

  const genderType = [
    { id: "M", label: "Male" },
    { id: "F", label: "Female" },
    { id: "O", label: "Other" },
  ];

  const { data: dropdownOptions, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () => getDropdownData(dropdownConst.STUDENT),
  });

  useEffect(() => {
    if (teacher) {
      const initialValues = {
        firstName: teacher.firstName || "",
        lastName: teacher.lastName || "",
        emailAddress: teacher.email || "",
        type: 1,
        role: 1,
        gender: teacher.gender || "",
        dateOfBirth: teacher.dateofBirth
          ? new Date(teacher.dateofBirth).toISOString().split("T")[0]
          : "",
        address: teacher.address || "",
        city: teacher.city || "",
        state: teacher.state || "",
        pincode: teacher.pincode || "",
        country: teacher.country || "",
        phoneNumber: teacher.phoneNumber || "",
        emergencyContactName: teacher.emergencyContactName || "",
        emergencyContactPhone: teacher.emergencyContactPhone || "",
        relationship: teacher.relationship || "",
        nationality: teacher.nationality || "",
        currentPosition: teacher.currentPosition || "",
        previousExperience: teacher.previousExperience || "",
      };
      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [teacher]);

  const mutation = useMutation({
    mutationKey: ["userMutation"],
    mutationFn: (payload) =>
      isEdit ? updateTeacher(payload) : addTeacher(payload),
    onSuccess: () => {
      toast.success(
        isEdit
          ? "Student updated successfully"
          : "Student created successfully",
      );
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  if (dropdownLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BaseForm
      initialValues={formInitialValues}
      validationSchema={studentSchema}
      onSubmit={(values) => {
        const payload = {
          ...values,
          userTypeId: parseInt(values.type),
          isActive: true,
          createdIdentityBy: currentUser.userId,
          roleIdentityId: values.role,
        };
        delete payload.type;
        delete payload.role;
        if (isEdit) {
          payload.teacherId = teacher.teacherId;
        } else {
          payload.teacherId = "";
        }
        mutation.mutate(payload);
      }}
      onSuccess={onSuccess}
      onClose={onClose}
      submitButtonText={teacher ? "Update Student" : "Create Student"}
    >
      {(formik) => (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <FormInput
                id="firstName"
                name="firstName"
                {...formik.getFieldProps("firstName")}
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
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.lastName}
                </div>
              )}
            </div>
          </div>

          <div>
            <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
            <FormInput
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              {...formik.getFieldProps("dateOfBirth")}
              placeholder="MM-DD-YYYY"
            />
            {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.dateOfBirth}
              </div>
            )}
          </div>
          <div>
            <FormLabel htmlFor="gender">Gender</FormLabel>
            <FormSelect
              id="gender"
              name="gender"
              valueKey="id"
              labelKey="label"
              options={[{ id: "", label: "Choose an option" }, ...genderType]}
              {...formik.getFieldProps("gender")}
            />
            {formik.touched.gender && formik.errors.gender && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.gender}
              </div>
            )}
          </div>
          <div>
            <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
            <FormInput
              id="phoneNumber"
              name="phoneNumber"
              {...formik.getFieldProps("phoneNumber")}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.phoneNumber}
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
            {formik.touched.emailAddress && formik.errors.emailAddress && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.emailAddress}
              </div>
            )}
          </div>

          <div>
            <FormLabel htmlFor="address">Address</FormLabel>
            <FormInput
              id="address"
              name="address"
              {...formik.getFieldProps("address")}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.address}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FormLabel htmlFor="city">City</FormLabel>
              <FormInput
                id="city"
                name="city"
                {...formik.getFieldProps("city")}
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
              />
              {formik.touched.pincode && formik.errors.pincode && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.pincode}
                </div>
              )}
            </div>
            <div>
              <FormLabel htmlFor="nationality">Nationality</FormLabel>
              <FormInput
                id="nationality"
                name="nationality"
                {...formik.getFieldProps("nationality")}
              />
              {formik.touched.nationality && formik.errors.nationality && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.nationality}
                </div>
              )}
            </div>
          </div>

          <div>
            <FormLabel htmlFor="emergencyContactName">
              Emergency Contact Name
            </FormLabel>
            <FormInput
              id="emergencyContactName"
              name="emergencyContactName"
              {...formik.getFieldProps("emergencyContactName")}
            />
            {formik.touched.emergencyContactName &&
              formik.errors.emergencyContactName && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.emergencyContactName}
                </div>
              )}
          </div>
          <div>
            <FormLabel htmlFor="relationship">Relationship</FormLabel>
            <FormInput
              id="relationship"
              name="relationship"
              {...formik.getFieldProps("relationship")}
            />
            {formik.touched.relationship && formik.errors.relationship && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.relationship}
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
            />
            {formik.touched.emergencyContactPhone &&
              formik.errors.emergencyContactPhone && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.emergencyContactPhone}
                </div>
              )}
          </div>
        </>
      )}
    </BaseForm>
  );
};
