import { BaseForm } from "../common/BaseForm";
import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Checkbox,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "../form/FormElements";
import {
  getAccessRightsByRole,
  createRole,
  updateRole,
} from "../../../api/services/roleService";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";
import { Tooltip } from "../../components/common/Tooltip";
import { Info } from "lucide-react";
import { getDropdownData } from "../../../api/services/utilityService";
import { dropdownConst } from "../../../lib/dropdownConst";

const roleSchema = Yup.object().shape({
  roleName: Yup.string().required("Role is required"),
  isActive: Yup.boolean(),
  type: Yup.string().required("Type is required"),
});

const PERMISSIONS = ["List", "Add", "Edit", "Delete", "View", "ActiveStatus"];

export const RoleForm = ({
  role,
  onSubmit,
  isSubmitting,
  onClose,
  onSuccess,
  isEdit = false,
}) => {
  const { user: currentUser, currSelectedSchool } = useContext(AuthContext);
  const roleId = role?.roleId || "0";
  const [modules, setModules] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);

  const { data: roleRightsData, isLoading: roleRightsDataLoading } = useQuery({
    queryKey: ["roleRightsData", roleId],
    queryFn: () => getAccessRightsByRole(roleId),
  });

  const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () => getDropdownData(`${dropdownConst.USER_TYPE}`),
  });
  useEffect(() => {
    if (roleRightsData?.isSuccess && dropdownData?.isSuccess) {
      const rightsData = roleRightsData.data;
      setModules(rightsData);

      const types = dropdownData.options.filter(
        (option) => option.optionGroup === dropdownConst.USER_TYPE,
      );
      setUserTypes(types);
      const typeId =
        types
          .find((type) => type.optionLabel === role?.userType)
          ?.optionValue?.toString() || "";

      const initialValues = {
        roleId: roleId,
        roleCode: role?.roleCode || "",
        roleName: role?.roleName || "",
        description: role?.description || "",
        isActive: role?.isActive || true,
        schoolId: currSelectedSchool,
        type: typeId,
      };

      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [roleRightsData, role, roleId]);

  const handleModuleChange = (moduleId, isChecked) => {
    modules &&
      setModules(
        modules.map((module) => {
          if (module.id === moduleId) {
            return {
              ...module,
              rights: module.rights.map((right) => ({
                ...right,
                canAccess: isChecked,
              })),
            };
          }
          return module;
        }),
      );
  };

  const handleRightChange = (moduleId, rightId, isChecked) => {
    modules &&
      setModules(
        modules.map((module) => {
          if (module.id === moduleId) {
            const updatedRights = module.rights.map((right) => {
              if (right.accessRightsId === rightId) {
                return { ...right, canAccess: isChecked };
              }
              return right;
            });
            const allSelected = updatedRights.every((right) => right.canAccess);

            return {
              ...module,
              rights: updatedRights,
              canAccess: allSelected,
            };
          }
          return module;
        }),
      );
  };

  const mutation = useMutation({
    mutationKey: ["roleMutation"],
    mutationFn: (payload) => (role ? updateRole(payload) : createRole(payload)),
    onSuccess: () => {
      toast.success(
        role ? "Role updated successfully" : "Role created successfully",
      );
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  if (roleRightsDataLoading || !isDataReady) {
    return <div>Loading...</div>;
  }

  return (
    <BaseForm
      initialValues={formInitialValues}
      validationSchema={roleSchema}
      onSubmit={(values) => {
        const payload = {
          ...values,
          userTypeId: parseInt(values.type),
          roleName: values.roleName,
          description: values.description,
          accessRights: modules,
          isActive: values.isActive,
          isDefault: false,
          createdIdentityBy: currentUser.userId,
          roleId: roleId,
          schoolId: currSelectedSchool,
        };
        delete payload.type;
        mutation.mutate(payload);
      }}
      onSuccess={onSuccess}
      onClose={onClose}
      submitButtonText={role ? "Update Role" : "Create Role"}
    >
      {(formik) => (
        <>
          {formInitialValues.roleCode && (
            <div>
              <FormLabel htmlFor="roleCode">Code </FormLabel>
              <FormInput
                id="roleCode"
                name="roleCode"
                disabled
                {...formik.getFieldProps("roleCode")}
              />
            </div>
          )}
          <div>
            <FormLabel htmlFor="roleName">Role</FormLabel>
            <FormInput
              id="roleName"
              name="roleName"
              maxLength="50"
              {...formik.getFieldProps("roleName")}
            />
            {formik.touched.roleName && formik.errors.roleName && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.roleName}
              </div>
            )}
          </div>
          <div>
            <FormLabel htmlFor="type">Type</FormLabel>
            <FormSelect
              id="type"
              name="type"
              options={[
                { optionValue: "", optionLabel: "Choose an option" },
                ...userTypes,
              ]}
              {...formik.getFieldProps("type")}
            />
            {formik.touched.type && formik.errors.type && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.type}
              </div>
            )}
          </div>
          <div>
            <FormLabel htmlFor="description">Description </FormLabel>
            <FormTextarea
              id="description"
              name="description"
              maxLength="200"
              {...formik.getFieldProps("description")}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.description}
              </div>
            )}
          </div>

          <h2 className="text-left text-lg font-semibold">Access Rights</h2>
          <div className="relative max-h-[500px] overflow-y-auto">
            <table className="min-w-full table-auto rounded-lg bg-white shadow-md">
              <thead className="sticky top-0 z-20 bg-gray-100 shadow-sm">
                <tr className="text-left text-sm font-medium text-gray-800 uppercase">
                  <th className="px-3 py-3 pt-3 pb-3 text-left">Module</th>
                  <th className="px-5 py-3 pt-3 pb-3 text-left">All</th>
                  <th className="px-2 py-3 pt-3 pb-3 text-center">List</th>
                  <th className="px-2 py-3 pt-3 pb-3 text-center">Add</th>
                  <th className="px-2 py-3 pt-3 pb-3 text-center">Edit</th>
                  <th className="px-2 py-3 pt-3 pb-3 text-center">Delete</th>
                  <th className="px-2 py-3 pt-3 pb-3 text-center">View</th>
                  <th className="px-2 py-3 pt-3 pb-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {modules &&
                  modules.map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="p-3 px-2 py-2 text-center text-sm font-medium text-gray-900 sm:p-3 sm:text-sm">
                        <div className="flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                          <Tooltip content={<p>{permission.description}</p>}>
                            <div className="flex cursor-help items-center gap-1">
                              <span className="max-w-[120px] truncate sm:max-w-none">
                                {permission.moduleName}
                              </span>
                              <Info className="h-4 w-4 shrink-0" />
                            </div>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="p-2 px-6 text-center text-sm font-medium text-gray-900">
                        <div className="flex justify-between text-center">
                          <Checkbox
                            className="items-right h-4 w-4"
                            checked={permission.rights.every(
                              (right) => right.canAccess,
                            )}
                            onChange={(e) =>
                              handleModuleChange(
                                permission.id,
                                e.target.checked,
                              )
                            }
                          />
                        </div>
                      </td>
                      {PERMISSIONS.map((permissionName) => (
                        <>
                          {" "}
                          {permission.rights.some(
                            (right) => right.rightName === permissionName,
                          ) ? (
                            <td
                              key={permissionName}
                              className="p-2 px-6 text-center text-sm font-medium text-gray-900"
                            >
                              <div className="flex items-center justify-center text-center">
                                <Checkbox
                                  className="h-4 w-4"
                                  checked={permission.rights.some(
                                    (right) =>
                                      right.rightName === permissionName &&
                                      right.canAccess,
                                  )}
                                  onChange={(e) =>
                                    handleRightChange(
                                      permission.id,
                                      permission.rights.find(
                                        (right) =>
                                          right.rightName === permissionName,
                                      ).accessRightsId,
                                      e.target.checked,
                                    )
                                  }
                                />
                              </div>
                            </td>
                          ) : (
                            <td></td>
                          )}
                        </>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div></div>
        </>
      )}
    </BaseForm>
  );
};
