import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Drawer from "../common/Drawer";
import {
  FormInput,
  FormLabel,
  FormSelect,
  PrimaryButton,
} from "../form/FormElements";

export const UserListItem = ({ user }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getStatusColor = (status) => {
    let curr_status = status == "True" ? "verified" : "unverified";
    switch (curr_status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "unverified":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  function generateRandomName() {
    const firstNames = ["Aryan", "Sanya", "Keshav", "Neha", "Rohan", "Priya"];
    const lastNames = ["Sharma", "Verma", "Iyer", "Das", "Kapoor", "Malik"];

    const randomFirst =
      firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${randomFirst} ${randomLast}`;
  }

  function getRandomTypeWithCode() {
    const types = ["Caregiver", "Resident", "Family Member", "Nurse", "Doctor"];

    // Select a random type
    const type = types[Math.floor(Math.random() * types.length)];

    // Generate a 3-digit random number
    const randomThreeDigits = String(Math.floor(100 + Math.random() * 900)); // Ensures a 3-digit number (100-999)

    // Construct the 5-digit format where the first two digits are "00" and last three are random
    const code = `${type.charAt(0).toUpperCase()}-00${randomThreeDigits}`;

    return { type, code };
  }

  const { type, code } = getRandomTypeWithCode();
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-left whitespace-nowrap">
          <span className="text-sm text-gray-900">{code}</span>
        </td>
        <td className="px-6 py-4 text-left whitespace-nowrap">
          <span className="text-sm text-gray-700">{generateRandomName()}</span>
        </td>
        <td className="px-6 py-4 text-left whitespace-nowrap">
          <span className="text-sm text-gray-700">{user.email}</span>
        </td>
        <td className="px-6 py-4 text-left whitespace-nowrap">
          <span className="text-sm text-gray-700">{type}</span>
        </td>
        <td className="px-6 py-4 text-left whitespace-nowrap">
          <span
            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(user.emailConfirmed)}`}
          >
            {user.emailConfirmed == "True" ? "Verified" : "Unverified"}
          </span>
        </td>
        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
          <div className="flex space-x-3">
            <button className="text-primary hover:text-blue-900">
              <PencilIcon
                onClick={() => setIsDrawerOpen(true)}
                className="h-5 w-5"
              />
            </button>
            <button className="text-red-600 hover:text-red-900">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </td>
      </tr>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Edit User`}
      >
        <form className="space-y-4 p-4">
          <FormLabel htmlFor="fullName">Full Name</FormLabel>
          <FormInput id="fullName" type="fullName" autoComplete="fullName" />
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput id="email" type="email" autoComplete="email" />

          <FormLabel htmlFor="category">Type</FormLabel>
          <FormSelect
            id="type"
            name="type"
            options={[
              { value: "", label: "Choose an option" },
              { value: "caregiver", label: "Caregiver" },
              { value: "doctor", label: "Doctor" },
              { value: "nurse", label: "Nurse" },
              { value: "resident", label: "Resident" },
              { value: "family_member", label: "Family Member" },
            ]}
            error="This field is required"
          />

          <FormLabel htmlFor="category">Roles</FormLabel>
          <FormSelect
            id="type"
            name="type"
            options={[
              { value: "", label: "Choose an option" },
              { value: "Executive Director", label: "Executive Director" },
              { value: "Resident Caregiver", label: "Resident Caregiver" },
              {
                value: "Resident Service Coordinator",
                label: "Resident Service Coordinator",
              },
              { value: "Resident Supervisor", label: "Resident Supervisor" },
            ]}
            error="This field is required"
          />

          <div className="absolute bottom-0 left-0 w-full p-4">
            <PrimaryButton type="submit" className="w-full">
              Update User
            </PrimaryButton>
          </div>
        </form>
      </Drawer>
    </>
  );
};
