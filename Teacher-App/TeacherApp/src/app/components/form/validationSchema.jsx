import * as Yup from "yup";

const onlyAlphabetsNoSpace = (fieldName = "This field") =>
  Yup.string()
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .matches(/^[A-Za-z]+$/, `must contain only alphabets without spaces`)
    .required(`${fieldName} is required`);

const onlyAlphabetsWithSpace = (fieldName = "This field") =>
  Yup.string()
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .matches(
      /^[A-Za-z]+( [A-Za-z]+)*$/,
      `must contain only alphabets and spaces`,
    )
    .required(`${fieldName} is required`);

// const validDate = (label, options = {}) =>
//   Yup.date()
//     .transform((value, originalValue) => {
//       const date = new Date(originalValue);
//       return isNaN(date) ? undefined : date;
//     })
//     .typeError(
//       `Please enter a valid ${label.toLowerCase()} in MM-DD-YYYY format`,
//     )
//     .test(
//       "not-in-future",
//       `${label} cannot be in the future`,
//       (value) => !options.disallowFuture || (value && value <= new Date()),
//     )
//     .required(`${label} is required`);
const validDate = (label, options = {}) =>
  Yup.date()
    .transform((value, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined ||
        originalValue === "null"
      ) {
        return null;
      }
      const date = new Date(originalValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .nullable()
    .typeError(
      `Please enter a valid ${label.toLowerCase()} in MM-DD-YYYY format`,
    )
    .test(
      "not-in-future",
      `${label} cannot be in the future`,
      (value) => !options.disallowFuture || (value && value <= new Date()),
    );

const zipCode = (label) =>
  Yup.string()
    .matches(/^\d{3,6}(-\d{4})?$/, `must be a valid ZIP or PIN code`)
    .required(`${label} is required`);

const tenDigitPhone = (label) =>
  Yup.string().matches(/^[0-9]{10}$/, `${label} must be exactly 10 digits`);
const validYear = (label) =>
  Yup.number()
    .typeError("Completion Year must be a number")
    .min(1900, "Year must be valid")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .required("Completion Year is required");

export const userFormValidationSchema = Yup.object().shape({
  firstName: onlyAlphabetsNoSpace("First Name"),

  lastName: onlyAlphabetsNoSpace("Last Name"),

  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  role: Yup.string().required("Role is required"),
});

export const userProfileValidationSchema = Yup.object().shape({
  firstName: onlyAlphabetsNoSpace("First Name"),

  lastName: onlyAlphabetsNoSpace("Last Name"),

  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  // dateOfBirth: validDate("Date of Birth", { disallowFuture: true }),

  // address: Yup.string()
  //   .matches(
  //     /^[a-zA-Z0-9\s\-\.,\(\)\/&]*$/,
  //     "Only letters, numbers, spaces and - , . ( ) & / are allowed",
  //   )
  //   .required("Address is required"),

  // city: onlyAlphabetsWithSpace("City"),

  // state: onlyAlphabetsWithSpace("State"),

  // country: onlyAlphabetsWithSpace("Country"),

  gender: Yup.string().required("Gender is required"),

  // pincode: zipCode("Zipcode"),

  // phoneNumber: tenDigitPhone("Contact Number"),

  // emergencyContactName: onlyAlphabetsWithSpace("Emergency contact name"),

  // emergencyContactPhone: tenDigitPhone("Emergency Contact"),
});

export const SchoolFormValidationSchema = Yup.object().shape({
  name: Yup.string().required("School Name is required"), // schoolName

  stateId: Yup.string().required("State is required"),

  districtId: Yup.string().required("District is required"),

  // cityId: Yup.string().required("City is required"),
  cityId: Yup.string().nullable(),
  cityLabel: Yup.string().required("City is required"),

  contactNumber: tenDigitPhone("Contact Number"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  zipCode: zipCode("Zipcode"),

  address: Yup.string()
    .matches(
      /^[a-zA-Z0-9\s\-\.,\(\)\/&]*$/,
      "Only letters, numbers, spaces and - , . ( ) & / are allowed",
    )
    .required("Address is required"),
});

// export const LeaveFormValidationSchema = Yup.object().shape({
//   startDate: validDate("Start Date").test(
//     "not-weekend",
//     "Weekends are not allowed",
//     (value) => {
//       if (!value) return true;
//       const day = value.getDay();
//       return day !== 0 && day !== 6;
//     },
//   ),
//   endDate: validDate("End Date")
//     .test("not-weekend", "Weekends are not allowed", (value) => {
//       if (!value) return true;
//       const day = value.getDay();
//       return day !== 0 && day !== 6;
//     })
//     .when("startDate", (startDate, schema) =>
//       startDate
//         ? schema.min(
//             startDate,
//             "End date cannot be earlier than the start date.",
//           )
//         : schema,
//     ),
//   reason: Yup.string()
//     .matches(
//       /^[a-zA-Z0-9\s\-\.,\(\)\/&]*$/,
//       "Only letters, numbers, spaces and - , . ( ) & / are allowed",
//     )
//     .required("Reason is required"),
// });

export const studentAcademicInfoValidationSchema = Yup.object().shape({
  gradeLevel: Yup.string().required("Grade Level is required"),

  major: Yup.string().required("Major is required"),

  enrollmentStatus: Yup.string().required("Enrollment Status is required"),

  academicStanding: Yup.string().required("Academic Standing is required"),

  expectedGraduation: validDate("Expected Graduation", {
    disallowFuture: false,
  }),

  transcript: Yup.string().required("Transcript is required"),
});

export const studentPersonalInfoFormValidationSchema = Yup.object().shape({
  studentNumber: Yup.string().required("Current Position is required"),

  firstName: onlyAlphabetsNoSpace("First Name"),

  lastName: onlyAlphabetsNoSpace("Last Name"),

  gender: Yup.string().required("Gender is required"),

  phoneNumber: tenDigitPhone("Contact Number"),

  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  dateOfBirth: validDate("Date of Birth", { disallowFuture: true }),

  address: Yup.string()
    .matches(
      /^[a-zA-Z0-9\s\-\.,\(\)\/&]*$/,
      "Only letters, numbers, spaces and - , . ( ) & / are allowed",
    )
    .required("Address is required"),

  city: onlyAlphabetsWithSpace("City"),

  state: onlyAlphabetsWithSpace("State"),

  pincode: zipCode("Zipcode"),

  nationality: Yup.string().required("Nationality is required"),

  relationship: Yup.string().required("Relationship is required"),

  emergencyContactName: onlyAlphabetsWithSpace("Emergency contact name"),

  emergencyContactNumber: tenDigitPhone("Emergency Contact"),

  // guardianRelationship: Yup.string().required("Relationship is required"),

  // guardianName: onlyAlphabetsWithSpace("Guardian Name"),

  // guardianPhoneNumber: tenDigitPhone("Phone Number"),

  gradeId: Yup.string().required("Grade Level is required"),
});

export const studentPreviousEducationFormValidationSchema = Yup.object().shape({
  schoolName: Yup.string().required("School Name is required"),

  degreeEarned: Yup.string().required("Degree Earned is required"),

  completionYear: validYear("Completion Year"),
});

export const studentCoursesFormValidationSchema = Yup.object().shape({
  courseCode: Yup.string().required("Course Code is required"),

  courseName: Yup.string().required("Course Name is required"),
});

export const studentGuardianFormValidationSchema = Yup.object().shape({
  guardianRelationship: Yup.string().required("Relationship is required"),
  firstName: onlyAlphabetsNoSpace("First Name"),
  lastName: onlyAlphabetsNoSpace("Last Name"),
  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  guardianPhoneNumber: tenDigitPhone("Phone Number"),
});

export const studentHealthInfoFormValidationSchema = Yup.object().shape({
  medications: Yup.string().required("Medications information is required"),
  physicianName: Yup.string().required("Physician Name is required"),
  disabilityInfo: Yup.string().required("Disability Info is required"),
});

export const teacherPersonalInfoFormValidation = Yup.object().shape({
  firstName: onlyAlphabetsNoSpace("First Name"),

  lastName: onlyAlphabetsNoSpace("Last Name"),

  emailAddress: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  // dateOfBirth: validDate("Date of Birth", { disallowFuture: true }),

  gender: Yup.string(),
});

export const teacherOtherInfoFormValidation = Yup.object().shape({
  nationality: Yup.string().required("Nationality is required"),

  currentPosition: Yup.string().required("Current Position is required"),

  relationship: Yup.string().required("Relationship is required"),

  // previousExperience: Yup.string().required("Previous Experience is required"),
});

export const teacherCoursesFormValidation = Yup.object().shape({
  courseCode: Yup.string().required("Course Code is required"),

  courseName: Yup.string().required("Course Name is required"),
});

export const teacherVolunteerFormValidation = Yup.object().shape({
  activityName: Yup.string().required("Activityn Name is required"),

  organizationName: Yup.string().required("Organization Name is required"),

  role: Yup.string().required("Role is required"),

  durationMonths: Yup.string()
    .required("Duration Months is required")
    .matches(/^\d+$/, "Duration Months must be digits only"),

  impact: Yup.string().required("Impact is required"),
});

export const teacherExtracurricularsFormValidation = Yup.object().shape({
  curricularType: Yup.string().required("Curricular Type is required"),

  curricularName: Yup.string().required("Curricular Name is required"),

  role: Yup.string().required("Role is required"),

  achievements: Yup.string().required("Achievements is required"),

  yearsInvolvement: Yup.number()
    .typeError("Years Of Experience must be a number")
    .required("Years Of Experience is required")
    .min(0, "Years Of Experience cannot be negative"),
});

export const teacherAcademicInfoFormValidation = Yup.object().shape({
  qualifications: Yup.string().required("Qualifications is required"),
  // teachingCredentials: Yup.string().required(
  //   "Teaching Credentials is required",
  // ),

  subjectExpertise: Yup.string().required(
    "Subject Expertise Position is required",
  ),

  // yearsOfExperience: Yup.number()
  //   .typeError("Years Of Experience must be a number")
  //   .required("Years Of Experience is required")
  //   .min(0, "Years Of Experience cannot be negative"),

  // professionalDevelopment: Yup.string().required(
  //   "Professional Development is required",
  // ),

  currentPosition: Yup.string().required("Current Position is required"),
});

export const teacherHealthInfoFormValidation = Yup.object().shape({
  medicalCondition: Yup.string().required("Medical Condition is required"),
  primaryCarePhysician: Yup.string().required(
    "primary Care Physician is required",
  ),

  healthInsurance: Yup.string().required("Health Insurance is required"),
});

export const teacherLeaveFormValidation = () => {
  return Yup.object().shape({
    leaveStartDate: validDate("Leave start date").test(
      "not-weekend",
      "Weekends are not allowed",
      (value) => {
        if (!value) return true;
        const day = new Date(value).getDay();
        return day !== 0 && day !== 6;
      },
    ),
    leaveEndDate: validDate("Leave end date")
      .test("not-weekend", "Weekends are not allowed", (value) => {
        if (!value) return true;
        const day = new Date(value).getDay();
        return day !== 0 && day !== 6;
      })
      .when("leaveStartDate", (startDate, schema) =>
        startDate
          ? schema.min(
              startDate,
              "End date cannot be earlier than the start date.",
            )
          : schema,
      ),
    reason: Yup.string()
      .matches(
        /^[a-zA-Z0-9\s\-\.,\(\)\/&]*$/,
        "Only letters, numbers, spaces and - , . ( ) & / are allowed",
      )
      .required("Reason is required"),
  });
};

export const teacherGradeSubjectAllocationFormValidationSchema =
  Yup.object().shape({
    gradeId: Yup.string().required("Grade is required"),
    subjectId: Yup.string().required("Subject is required"),
  });

//OnKeyPress Events :
export const keyPressOnlyAlphabets = (e) => {
  // for onkeypress allow only alphabets for firstname,lastname etc
  if (!/^[A-Za-z]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const keyPressZipCode = (e) => {
  if (!/^[A-Za-z0-9\s\-]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const keyPressAddress = (e) => {
  const regex = /^[a-zA-Z0-9\s\-.,()\/&]$/;
  if (!regex.test(e.key)) {
    e.preventDefault();
  }
};

export const keyPressOnlyAlphabetsWithSpace = (e) => {
  const regex = /^[A-Za-z\s]$/;
  if (!regex.test(e.key)) {
    e.preventDefault();
  }
};
