// import React, { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../../../contexts/authContext";
// import { getSchoolSubject } from "../../../api/services/dropDownMasterService";
// import {
//   saveSchoolGrades,
//   AddSubjectToGrade,
//   AddSubjectMaster,
//   getGradeMaster,
//   deleteGrade,
//   deleteSubject,
// } from "../../../api/services/SettingsService";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import Model from "../common/Model";
// import {
//   Calendar,
//   GraduationCap,
//   SquarePen,
//   TrashIcon,
//   XCircleIcon,
// } from "lucide-react";
// import { Tooltip } from "../common/Tooltip";

// const SubjectSettings = () => {
//   const { user, currSelectedSchool, currSelectedAcademicYear } =
//     useContext(AuthContext);
//   const [isSubjectPopupOpen, setIsSubjectPopupOpen] = useState(false);
//   const [tempSelected, setTempSelected] = useState([]);
//   //   const [loading, setLoading] = useState(true);

//   const [formData, setFormData] = useState({
//     startDate: "",
//     endDate: "",
//   });

//   const {
//     data: subjects,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: ["subjectList", currSelectedSchool],
//     queryFn: () => getSchoolSubject(currSelectedSchool),
//     enabled: !!currSelectedSchool,
//   });

//   //   if (loading) return <div>Loading subjects...</div>;

//   return (
//     <div className="flex h-full flex-col px-3">
//       <div className="mb-2 flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <div className="bg-primary rounded-xl p-2">
//             <GraduationCap className="h-6 w-6 text-white" />
//           </div>
//           <div>
//             <h2 className="text-left text-gray-800">Manage subjects</h2>
//             {/*    <p className="text-left text-gray-600">Manage Grades</p>*/}
//           </div>
//         </div>
//         <button
//           onClick={() => {
//             setIsSubjectPopupOpen(true);
//           }}
//           className="bg-primary rounded px-4 py-2 text-white"
//         >
//           Add subject
//         </button>
//       </div>

//       <Model
//         isOpen={isSubjectPopupOpen}
//         onClose={() => {
//           setFormData({ subject: "", subjectCode: "" });
//           setIsSubjectPopupOpen(false);
//           setTempSelected([]);
//         }}
//         title="Add Subject"
//       ></Model>
//     </div>
//   );
// };

// export default SubjectSettings;

///////////////22222222222222222222222//////////////////////////
import React, { useContext, useState } from "react";
import { AuthContext } from "../../../contexts/authContext";
import {
  getSchoolSubject,
  AddSubjectToSchool,
  deleteSubjectFromSchool,
} from "../../../api/services/SettingsService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Model from "../common/Model";
import { GraduationCap, SquarePen, TrashIcon } from "lucide-react";

const SubjectSettings = () => {
  const { user, currSelectedAcademicYear, currSelectedSchool } =
    useContext(AuthContext);
  const [isSubjectPopupOpen, setIsSubjectPopupOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [formData, setFormData] = useState({ subject: "", subjectCode: "" });
  const [editId, setEditId] = useState(0);

  const {
    data: subjects,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["subjectList", currSelectedSchool],
    queryFn: () => getSchoolSubject(currSelectedSchool),
    enabled: !!currSelectedSchool,
  });

  const addOrUpdateMutation = useMutation({
    mutationFn: (payload) => AddSubjectToSchool(payload),
    onSuccess: () => {
      toast.success(
        formMode === "add" ? "Subject added successfully!" : "Subject updated!",
      );
      refetch();
      setIsSubjectPopupOpen(false);
      setFormData({ subject: "", subjectCode: "" });
      setEditId(0);
    },
    onError: () => toast.error("Something went wrong!"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSubjectFromSchool(id),
    onSuccess: () => {
      toast.success("Subject deleted!");
      refetch();
    },
    onError: () => toast.error("Failed to delete subject!"),
  });

  const handleSave = () => {
    if (!formData.subject || !formData.subjectCode) {
      toast.error("Both fields are required");
      return;
    }

    const payload = {
      schoolSubjectId: editId,
      schoolId: currSelectedSchool,
      Subject: formData.subject,
      subjectCode: formData.subjectCode,
      createdBy: user.userId,
    };

    addOrUpdateMutation.mutate(payload);
  };

  return (
    <div className="flex h-full flex-col px-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-xl p-2">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-left text-gray-800">Manage Subjects</h2>
          </div>
        </div>
        <button
          onClick={() => {
            setFormMode("add");
            setFormData({ subject: "", subjectCode: "" });
            setIsSubjectPopupOpen(true);
          }}
          className="bg-primary rounded px-4 py-2 text-white"
        >
          Add subject
        </button>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          subjects?.data?.data?.map((subj) => (
            <div
              key={subj.value}
              className="relative rounded-lg border border-gray-300 bg-gray-50 text-black shadow-sm"
            >
              {/* Card Header with Actions */}
              <div className="flex items-start justify-between p-4">
                <div>
                  <h3 className="mb-1 text-start text-sm leading-none font-semibold tracking-tight text-gray-800">
                    {subj.label}
                  </h3>
                  <p className="text-start text-sm text-gray-500">
                    {subj.subjectCode ? "Code: " + subj.subjectCode : ""}
                  </p>
                </div>

                {!subj.isDefault && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setFormMode("edit");
                        setFormData({
                          subject: subj.label,
                          subjectCode: subj.subjectCode || "",
                        });
                        setEditId(subj.value);
                        setIsSubjectPopupOpen(true);
                      }}
                      className="rounded p-1 text-blue-600 hover:bg-blue-100"
                      title="Edit"
                    >
                      <SquarePen className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(subj.value)}
                      className="rounded p-1 text-red-600 hover:bg-red-100"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Model
        isOpen={isSubjectPopupOpen}
        onClose={() => {
          setIsSubjectPopupOpen(false);
          setFormData({ subject: "", subjectCode: "" });
          setEditId(0);
        }}
        title={formMode === "add" ? "Add Subject" : "Update Subject"}
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-gray-700">
              Subject Code
            </label>
            <input
              type="text"
              value={formData.subjectCode}
              disabled={formMode == "edit" ? true : false}
              onChange={(e) =>
                setFormData({ ...formData, subjectCode: e.target.value })
              }
              // className="mt-1 block w-full rounded border"
              className={`mt-1 block w-full rounded border px-2 py-1 ${
                formMode === "edit"
                  ? "cursor-not-allowed bg-gray-100 text-gray-600"
                  : ""
              }`}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsSubjectPopupOpen(false)}
              className="rounded border px-4 py-2"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="bg-primary rounded px-4 py-2 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </Model>
    </div>
  );
};

export default SubjectSettings;
