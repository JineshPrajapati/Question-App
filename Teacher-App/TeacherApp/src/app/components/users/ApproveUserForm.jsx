import {
  FormLabel,
  FormSelect,
  MultiSelectWithoutFormik,
  PrimaryButton,
} from "../form/FormElements";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { dropdownConst } from "../../../lib/dropdownConst";
// import { getDropdownData } from "../../../api/services/utilityService";
import { getRolesList } from "../../../api/services/roleService";
import { getSchoolsList } from "../../../api/services/schoolService";
import { activateUser } from "../../../api/services/userService";
import { toast } from "react-toastify";
import { AuthContext } from "../../../contexts/authContext";
export const ApproveUserForm = ({ user, onSuccess }) => {
  const { user: UserData } = useContext(AuthContext);
  // const [userTypeId, setUserTypeId] = useState("");
  const [schoolIds, setSchoolIds] = useState([]);
  const [roleId, setRoleId] = useState("");
  // const [userTypes, setUserTypes] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [schools, setSchools] = useState([]);

  // const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
  //   queryKey: ["dropdownData"],
  //   queryFn: () => getDropdownData(`${dropdownConst.USER_TYPE}`),
  // });

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["roleData"],
    queryFn: () =>
      getRolesList({
        activeOnly: true,
        sortBy: "RoleName",
        sortDirection: "ASC",
        pageNumber: 1,
        pageSize: 100,
      }),
  });

  const { data: schoolData, isLoading: schoolLoading } = useQuery({
    queryKey: ["schoolData"],
    queryFn: () =>
      getSchoolsList({
        activeOnly: true,
        sortBy: "SchoolName",
        sortDirection: "ASC",
        pageNumber: 1,
        pageSize: 100,
      }),
  });

  useEffect(() => {
    // if (dropdownData && dropdownData.isSuccess) {
    //   setUserTypes(
    //     dropdownData.options.filter(
    //       (option) => option.optionGroup === dropdownConst.USER_TYPE,
    //     ),
    //   );
    // }
    if (roleData && roleData.isSuccess) {
      setUserRoles(roleData.data);
    }
    if (schoolData && schoolData.isSuccess) {
      setSchools(schoolData.data);
    }
  }, [roleData, schoolData]);

  const handleSubmit = () => {
    mutation.mutate({
      // userType: parseInt(userTypeId),
      roleId: roleId,
      isActive: true,
      userId: user.userId,
      createdBy: UserData.userId,
      schoolIds: schoolIds.join(","),
    });
  };

  const mutation = useMutation({
    mutationFn: (payload) => activateUser(payload),
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success(response.message || "User activated successfully");
        onSuccess?.();
      } else {
        toast.error(response.message || "An error occurred");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });
  return (
    <div className="flex flex-col gap-4">
      {/* <div>
        <FormLabel htmlFor="type">User Type</FormLabel>
        <FormSelect
          id="type"
          className="w-full"
          onChange={(e) => setUserTypeId(e.target.value)}
          name="type"
          options={[
            { optionValue: "", optionLabel: "Choose an option" },
            ...userTypes,
          ]}
        />
      </div> */}
      <div>
        <FormLabel htmlFor="role">Role</FormLabel>
        <FormSelect
          id="role"
          className="w-full"
          onChange={(e) => setRoleId(e.target.value)}
          name="role"
          valueKey="roleId"
          labelKey="roleName"
          options={[{ roleId: "", roleName: "Choose an option" }, ...userRoles]}
        />
      </div>
      <div>
        <FormLabel htmlFor="schoolIds">School</FormLabel>
        <MultiSelectWithoutFormik
          name="schoolIds"
          value={schools.filter((school) =>
            schoolIds.includes(school.schoolId),
          )}
          onChange={(selectedOptions) => {
            setSchoolIds(selectedOptions.map((option) => option.value));
          }}
          options={[
            { value: "", label: "Choose an option" },
            ...schools.map((school) => ({
              value: school.schoolId,
              label: school.name,
            })),
          ]}
        />
      </div>
      <div>
        <PrimaryButton
          disabled={roleId === "" || schoolIds.length === 0}
          onClick={handleSubmit}
        >
          Verify
        </PrimaryButton>
      </div>
    </div>
  );
};
