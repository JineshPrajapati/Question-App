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
import { addSchool, updateSchool } from "../../../api/services/schoolService";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";
import { getLocationDropdown } from "../../../api/services/dropDownMasterService";
import {
  SchoolFormValidationSchema,
  keyPressAddress,
  keyPressZipCode,
} from "../form/validationSchema";

export const SchoolForm = ({
  school,
  onSubmit,
  isSubmitting,
  onClose,
  onSuccess,
  isEdit = false,
}) => {
  const { user: currentUser, currSelectedSchool } = useContext(AuthContext);
  const [stateCode, setStateCode] = useState(school?.stateCode || "");
  const [districtId, setDistrictId] = useState(school?.districtId || "");
  const [cityZipOptions, setCityZipOptions] = useState([]);
  const [isNotZipInclude, setNotIncludeZip] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [stateId, setStateId] = useState(school?.stateId || "");

  const { data: stateOptionsData } = useQuery({
    queryKey: ["states"],
    queryFn: () => getLocationDropdown(),
  });
  const { data: districtOptionsData } = useQuery({
    queryKey: ["districts", stateCode],
    queryFn: () => getLocationDropdown(stateCode),
    enabled: !!stateCode,
  });

  const { data: cityOptionsData } = useQuery({
    queryKey: ["cities", stateCode, districtId],
    queryFn: () => getLocationDropdown(stateCode, districtId),
    enabled: !!stateCode && !!districtId,
  });

  useEffect(() => {
    if (stateOptionsData?.data?.data?.length > 0 && school) {
      const stateCodeValue = stateOptionsData.data.data.find(
        (s) => s.value === (school?.stateId).toString(),
      );
      if (stateCodeValue) {
        setStateCode(stateCodeValue.stateCode || "");
        setStateId(stateCodeValue.value || "");
        setDistrictId(school.districtId || "");
      }
    }

    const initialValues = {
      name: school?.name || "",
      address: school?.address || "",
      zipCode: school?.zipCode || "",
      stateId: school?.stateId || "",
      districtId: school?.districtId || "",
      cityId: school?.cityId || "",
      email: school?.email || "",
      contactNumber: school?.contactNumber || "",
    };

    setFormInitialValues(initialValues);
  }, [school, stateOptionsData]);

  useEffect(() => {
    if (
      formInitialValues &&
      formInitialValues.cityId &&
      cityOptionsData?.data?.data?.length > 0
    ) {
      const selectedCity = cityOptionsData.data.data.find(
        (c) => c.value == formInitialValues.cityId,
      );

      if (selectedCity?.zipCodes) {
        const allMatchingZips = cityOptionsData.data.data
          .filter((c) => c.label == selectedCity.label)
          .map((c) => c.zipCodes)
          .join(",")
          .split(",")
          .map((z) => z.trim())
          .filter(Boolean);

        const uniqueZips = Array.from(new Set(allMatchingZips));
        setCityZipOptions(uniqueZips);
      } else {
        setCityZipOptions([]);
      }
    }
  }, [formInitialValues, cityOptionsData]);

  const groupedCities = React.useMemo(() => {
    if (!cityOptionsData?.data?.data) return {};

    return cityOptionsData.data.data.reduce((acc, c) => {
      if (!acc[c.label]) acc[c.label] = [];
      acc[c.label].push({ cityId: c.value, zip: c.zipCodes });
      return acc;
    }, {});
  }, [cityOptionsData]);

  const cityDropdownOptions = Object.keys(groupedCities).map((label) => ({
    value: label,
    label,
  }));
  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateSchool(payload) : addSchool(payload),
    onSuccess: () => {
      toast.success(
        isEdit ? "School updated successfully" : "School created successfully",
      );
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  if (!formInitialValues || !stateOptionsData) return <div>Loading...</div>;

  return (
    <BaseForm
      initialValues={formInitialValues}
      validationSchema={SchoolFormValidationSchema}
      onSubmit={(values) => {
        if (!values.cityId && values.zipCode) {
          const selectedCity = Object.values(groupedCities)
            .flat()
            .find((c) => c.zip === values.zipCode);

          if (selectedCity) {
            values.cityId = selectedCity.cityId;
          }
        }
        const payload = {
          ...values,
          isActive: true,
          stateId,
          createdBy: currentUser.userId,
          schoolId: isEdit ? school.schoolId : 0,
        };
        mutation.mutate(payload);
      }}
      onClose={onClose}
      submitButtonText={isEdit ? "Update School" : "Create School"}
    >
      {(formik) => (
        <>
          <div>
            <FormLabel htmlFor="name">School Name</FormLabel>

            <FormInput
              id="name"
              name="name"
              {...formik.getFieldProps("name")}
            />

            {formik.touched.name && formik.errors.name && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.name}
              </div>
            )}
          </div>
          <div>
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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FormLabel htmlFor="state">State</FormLabel>

              <FormSelect
                id="stateId"
                name="stateId"
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "", label: "Choose an option" },
                  ...(stateOptionsData?.data?.data || []),
                ]}
                value={formik.values.stateId}
                onChange={(e) => {
                  const value = e.target.value;
                  formik.setFieldValue("stateId", value);
                  formik.setTouched({ ...formik.touched, stateCode: true });
                  setStateId(value);
                  const selectedState = stateOptionsData?.data?.data.find(
                    (s) => s.value === value,
                  );
                  setStateCode(selectedState?.stateCode || "");
                }}
              />
              {formik.touched.stateId && formik.errors.stateId && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.stateId}
                </div>
              )}
            </div>

            <div>
              <FormLabel htmlFor="district">County</FormLabel>

              <FormSelect
                id="districtId"
                name="districtId"
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "", label: "Choose an option" },
                  ...(districtOptionsData?.data?.data || []),
                ]}
                value={formik.values.districtId}
                onChange={(e) => {
                  const value = e.target.value;
                  formik.setFieldValue("districtId", value);
                  formik.setTouched({ ...formik.touched, districtId: true });
                  setDistrictId(value);
                  formik.setFieldValue("cityId", "");
                }}
              />

              {formik.touched.districtId && formik.errors.value && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.districtId}
                </div>
              )}
            </div>

            <div>
              <FormLabel htmlFor="city">City</FormLabel>

              <FormSelect
                id="cityLabel"
                name="cityLabel"
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "", label: "Choose an option" },
                  ...cityDropdownOptions, // from groupedCities
                ]}
                value={formik?.values?.cityLabel || ""}
                onChange={(e) => {
                  const selectedLabel = e.target.value;
                  formik.setFieldValue("cityLabel", selectedLabel);

                  // load all zips for this city
                  const zips =
                    groupedCities[selectedLabel]?.map((c) => c.zip) || [];
                  setCityZipOptions(zips);

                  // reset zip + cityId
                  formik.setFieldValue("zipCode", "");
                  formik.setFieldValue("cityId", "");
                }}
              />

              {formik.touched.cityId && formik.errors.cityId && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.cityId}
                </div>
              )}
            </div>

            <div>
              <FormLabel htmlFor="zipCode">Zipcode</FormLabel>
              <MultiSelect
                name="zipCode"
                isMultiple={false}
                options={cityZipOptions.map((zip) => ({
                  value: zip,
                  label: zip,
                }))}
                formik={formik}
                onChange={(option) => {
                  const selectedZip = option?.value;
                  formik.setFieldValue("zipCode", selectedZip);

                  // find correct cityId from groupedCities
                  const selectedCity = Object.values(groupedCities)
                    .flat()
                    .find((c) => c.zip === selectedZip);

                  if (selectedCity) {
                    formik.setFieldValue("cityId", selectedCity.cityId);
                  }
                }}
                placeholder="Enter ZIP code"
              />
              {formik.touched.zipCode && formik.errors.zipCode && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.zipCode}
                </div>
              )}
            </div>
          </div>
          <div>
            <FormLabel htmlFor="email">Email</FormLabel>

            <FormInput
              id="email"
              name="email"
              {...formik.getFieldProps("email")}
            />

            {formik.touched.email && formik.errors.email && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.email}
              </div>
            )}
          </div>
          <div>
            <FormLabel htmlFor="contactNumber">Contact Number</FormLabel>

            <FormInput
              id="contactNumber"
              name="contactNumber"
              {...formik.getFieldProps("contactNumber")}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                formik.setFieldValue("contactNumber", val);
              }}
            />

            {formik.touched.contactNumber && formik.errors.contactNumber && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.contactNumber}
              </div>
            )}
          </div>
        </>
      )}
    </BaseForm>
  );
};
