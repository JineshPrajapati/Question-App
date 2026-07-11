import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import {
  FormInput,
  FormLabel,
  FormSelect,
  MultiSelect,
} from "../form/FormElements";
import { BaseForm } from "../common/BaseForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addUser, updateUser } from "../../../api/services/userService";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";
import {
  getLocationDropdown,
  getRoleDropdownList,
  getSchoolDropdownList,
} from "../../../api/services/dropDownMasterService";
import {
  keyPressAddress,
  keyPressOnlyAlphabets,
  keyPressOnlyAlphabetsWithSpace,
  keyPressZipCode,
  userFormValidationSchema,
} from "../form/validationSchema";

export const UserForm = ({
  user,
  onSubmit,
  isSubmitting,
  onClose,
  onSuccess,
  isEdit = false,
}) => {
  const { user: currentUser, currSelectedSchool } = useContext(AuthContext);
  const [userRoles, setUserRoles] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [selectedSchoolAddress, setSelectedSchoolAddress] = useState(null);

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["roleData", currentUser.userId],
    queryFn: () => getRoleDropdownList(currentUser.userId, currSelectedSchool),
  });

  const { data: schoolData, isLoading: schoolLoading } = useQuery({
    queryKey: ["schoolData", currentUser.userId],
    queryFn: () => getSchoolDropdownList(currentUser.userId),
  });

  const genderType = [
    { id: "Male", label: "Male" },
    { id: "Female", label: "Female" },
    { id: "Other", label: "Other" },
  ];
  useEffect(() => {
    if (roleData?.isSuccess && schoolData?.isSuccess) {
      const roles = Array.isArray(roleData.data?.data)
        ? roleData.data.data.map((role) => ({
            roleId: role.value,
            roleName: role.label,
          }))
        : [];
      const schoolsList = Array.isArray(schoolData.data?.data)
        ? schoolData.data.data
        : [];

      const roleId =
        roles.find((role) => role.roleName === user?.roleName)?.roleId || "";

      const initialValues = {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        emailAddress: user?.email || "",
        gender: user?.gender || "",
        role: roleId,
        schoolIds: user?.schoolIds?.split(",").map((id) => id.trim()) || [],
        currentSchoolId: currSelectedSchool,
      };

      if (schoolsList.length === 1) {
        initialValues.preferredSchoolId = schoolsList[0].value.toString();

        if (schoolsList[0]?.address) {
          setSelectedSchoolAddress(JSON.parse(schoolsList[0].address));
        }
      }
      setUserRoles(roles);
      setSchools(schoolsList);
      const filteredPreferredSchools = schoolsList.filter((s) =>
        initialValues.schoolIds.includes(s.value.toString()),
      );

      // ✅ if only 1 school → select it automatically
      if (filteredPreferredSchools.length === 1) {
        const onlySchool = filteredPreferredSchools[0];
        initialValues.preferredSchoolId = onlySchool.value.toString();

        if (onlySchool?.address) {
          setSelectedSchoolAddress(JSON.parse(onlySchool.address));
        }
      }
      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [roleData, schoolData, user]);

  const mutation = useMutation({
    mutationKey: ["userMutation"],
    mutationFn: (payload) => (isEdit ? updateUser(payload) : addUser(payload)),
    onSuccess: () => {
      toast.success(
        isEdit ? "User updated successfully" : "User created successfully",
      );
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  if (roleLoading || schoolLoading || !isDataReady || !formInitialValues) {
    return <div>Loading...</div>;
  }
  return (
    <BaseForm
      initialValues={formInitialValues}
      validationSchema={userFormValidationSchema}
      onSubmit={(values) => {
        const payload = {
          ...values,
          schoolIds: values.schoolIds.join(","),
          isActive: true,
          createdIdentityBy: currentUser.userId,
          roleIdentityId: values.role,
        };
        // delete payload.type;
        delete payload.role;
        if (isEdit) {
          payload.userId = user.userId;
        } else {
          payload.userId = "";
        }
        mutation.mutate(payload);
      }}
      onSuccess={onSuccess}
      onClose={onClose}
      submitButtonText={user ? "Update User" : "Create User"}
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
            <FormLabel htmlFor="schoolIds">School</FormLabel>
            <MultiSelect
              name="schoolIds"
              options={[
                { value: "", label: "Choose an option" },
                ...schools.map((school) => ({
                  value: school.value.toString(),
                  label: `${school.label}`,
                })),
              ]}
              formik={formik}
            />
            {formik.touched.schoolIds && formik.errors.schoolIds && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.schoolIds}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FormLabel htmlFor="role">Role</FormLabel>
              <FormSelect
                id="role"
                name="role"
                valueKey="roleId"
                labelKey="roleName"
                options={[
                  { roleId: "", roleName: "Choose an option" },
                  ...userRoles,
                ]}
                {...formik.getFieldProps("role")}
              />
              {formik.touched.role && formik.errors.role && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.role}
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
          </div>
       
        </>
      )}
    </BaseForm>
  );
};
