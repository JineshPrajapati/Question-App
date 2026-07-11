using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Repositories.SchemaDictionary
{
    public static class DatabaseSchema
    {

        public static readonly Dictionary<string, List<string>> TablesAbbre = new()
    {

  { "School" ,new List<string>{ "School","Center" } },
  { "ApplicationUser",new List<string>{ "User","Teacher", "Guardian", "Parent", "Admin", "Principal", "User Type" } },
  { "LessonDetail",new List<string>{ "Lesson","Lesson Detail","Lesson Plan Grade", "Lesson Plan Subject" } },
  { "YearlyLessonDetail",new List<string>{ "Lesson Yearly", "Yearly Lesson Detail", "Yearly Lesson", "Yearly Plan" } },
  { "MonthlyLessonDetail",new List<string>{ "Lesson Monthly", "Monthly Lesson Detail", "Monthly Lesson", "Monthly Plan" } },
  { "WeeklyLessonDetail",new List<string>{ "Lesson Weekly", "Weekly Lesson Detail", "Weekly Lesson", "Weekly Plan" } },
  { "DailyLessonDetail",new List<string>{ "Lesson Daily", "Daily Lesson Detail", "Daily Lesson", "Daily Plan" } },
  { "Student" ,new List<string>{ "Student","Classmate" } },
  { "Student_Card" ,new List<string>{ "Student Card", "Student Score", "Student Plan" } },
   };

        public static readonly Dictionary<string, List<string>> Tables = new()
    {

  { "School" ,new List<string>{ "SchoolId", "Name", "Address", "Zip", "Email","Phone", "State", "District" } },
  { "ApplicationUser" ,new List<string>{ "UserId", "First", "Last", "Name" ,"Email", "Status", "Phone","SchoolId", "Birth", "Emergency Contact", "Emergency Phone","Role"} }, 
  { "LessonDetail",new List<string>{ "LessonPlanId","SchoolId",  "AcademicYear", "TeacherId", "Grade", "Subject"} },
  { "YearlyLessonDetail",new List<string>{ "LessonPlanId","Start From",  "End To", "Yearly Lesson Plan"} },
  { "MonthlyLessonDetail",new List<string>{ "LessonPlanId","Start From",  "End To", "Monthly Lesson Plan" } },
  { "WeeklyLessonDetail",new List<string>{ "LessonPlanId","Start From",  "End To", "Weekly Lesson Plan"} },
  { "DailyLessonDetail",new List<string>{ "LessonPlanId","Lesson Date", "Daily Lesson Plan"} },
  { "Student",new List<string>{ "StudentNumber", "Name", "Birth", "School", "SchoolId", "Grade", "GradeId","Emergency Contact", "Emergency Number", "Address","City","State", "Zip", "Guardians" } },
  { "Student_Card",new List<string>{ "StudentNumber","Grade","Subject", "Score", "AcademicYear", "Component", "Assessment", "Assessment Value", "Assessment Period"} },
  };

        public static readonly List<(string FromTable, string FromCol, string ToTable, string ToCol)> Relationships = new()
    {
 ("ApplicationUser", "SchoolId", "School", "SchoolId"),
 ("School", "SchoolId", "Student", "SchoolId"),
 ("Student", "StudentNumber", "Student_Card", "StudentNumber"),
 ("School", "SchoolId", "LessonDetail", "SchoolId"),
 ("LessonDetail", "LessonPlanId","YearlyLessonDetail", "LessonPlanId"),
 ("LessonDetail", "LessonPlanId","MonthlyLessonDetail", "LessonPlanId"),
 ("LessonDetail", "LessonPlanId","WeeklyLessonDetail", "LessonPlanId"),
 ("LessonDetail", "LessonPlanId","DailyLessonDetail", "LessonPlanId"),
 ("ApplicationUser", "UserId","LessonDetail", "TeacherId")

   };

        public static readonly Dictionary<string, List<string>> AggregatesAbbre = new()
{
    { "COUNT", new List<string>
        { "COUNT", "CNT", "RowCount", "TotalCount", "NumberOf", "HowMany", "Records", "Rows", "Total", "Quantity",
          "Total Students", "Number of Students", "Student Count", "Total Lessons", "Number of Lessons",
          "Total Teachers", "Number of Teachers", "Class Count",
          "Daily Count", "Weekly Count", "Monthly Count", "Yearly Count", "Per Day Count", "Per Week Count" } },

    { "SUM", new List<string>
        { "SUM", "Total", "Addition", "Overall", "Aggregate", "TotalAmount", "GrandTotal", "Cumulative", "Combined",
          "Total Marks", "Total Score", "Total Hours", "Total Attendance", "Overall Lessons Completed",
          "Daily Total", "Weekly Total", "Monthly Total", "Yearly Total", "Cumulative Lessons" } },

    { "AVG", new List<string>
        { "AVG", "Average", "Mean", "AvgValue", "Typical", "CentralValue", "Expected", "OverallAverage", "Completion%",
          "Average Marks", "Average Score", "Average Grade", "Mean Attendance", "Average Progress", "Lesson Completion %",
          "Daily Average", "Weekly Average", "Monthly Average", "Yearly Average", "Per Day Average", "Per Week Average" } },

    { "MIN", new List<string>
        { "MIN", "Minimum", "Lowest", "Smallest", "Earliest", "First", "Least", "LowestValue",
          "Earliest Lesson Date", "Lowest Score", "Minimum Marks", "First Submission Date",
          "Earliest Daily", "Earliest Weekly", "Earliest Monthly", "Earliest Yearly" } },

    { "MAX", new List<string>
        { "MAX", "Maximum", "Highest", "Largest", "Biggest", "Latest", "Last", "Greatest", "TopValue",
          "Highest Score", "Maximum Marks", "Latest Lesson Date", "Last Submission Date", "Max Available Date",
          "Daily Max", "Weekly Max", "Monthly Max", "Yearly Max" } },

    { "STDEV", new List<string>
        { "STDEV", "STD", "StandardDeviation", "Variation", "Spread", "Volatility",
          "Marks Variation", "Score Spread", "Performance Deviation" } },

    { "STDEVP", new List<string>
        { "STDEVP", "STDDEV_P", "PopulationStdDev", "PopulationDeviation" } },

    { "VAR", new List<string>
        { "VAR", "Variance", "StatVariance", "VariationMeasure", "DataVariance",
          "Marks Variance", "Score Variance" } },

    { "VARP", new List<string>
        { "VARP", "VAR_P", "PopulationVariance", "OverallVariance" } },

    { "CHECKSUM_AGG", new List<string>
        { "CHECKSUM_AGG", "ChecksumAggregate", "CHK_AGG", "Checksum" } },

    { "GROUPING", new List<string>
        { "GROUPING", "GRP", "IsGrouped", "GroupingFlag" } },

    { "GROUPING_ID", new List<string>
        { "GROUPING_ID", "GRP_ID", "GroupingLevel", "GroupIdentifier" } },

    { "STRING_AGG", new List<string>
        { "STRING_AGG", "STR_AGG", "ConcatStrings", "JoinedText", "ListOf", "CombinedText", "MergeStrings",
          "List Subjects", "Comma Separated Lessons", "Joined Student Names", "Class List",
          "Daily Subjects", "Weekly Lessons", "Monthly Lessons", "Yearly Lessons" } },

    { "BIT_AND", new List<string>
        { "BIT_AND", "BitwiseAnd", "AllTrue", "LogicalAnd" } },

    { "BIT_OR", new List<string>
        { "BIT_OR", "BitwiseOr", "AnyTrue", "LogicalOr" } },

    { "BIT_XOR", new List<string>
        { "BIT_XOR", "BitwiseXor", "ExclusiveOr", "EitherButNotBoth" } },
};

        public static readonly Dictionary<string, string> Templates = new()
    {
    { "StudentProgress",
      @"SELECT 
            S.Name AS [Student Name], 
            Sub.Name AS [Subject], 
            COUNT(LP.Id) AS [Total Lessons], 
            SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) AS [Lessons Completed], 
            CAST(SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(LP.Id) AS DECIMAL(5,2)) AS [Completion %] 
        FROM Students S 
        JOIN LessonPlans LP ON S.GradeId = LP.GradeId 
        JOIN Subjects Sub ON LP.SubjectId = Sub.Id 
        WHERE S.Id = @CurrentUserId 
        GROUP BY S.Name, Sub.Name;"
    },

    { "LessonCoverage",
      @"SELECT 
            G.Name AS [Grade], 
            Sub.Name AS [Subject], 
            COUNT(LP.Id) AS [Planned Lessons], 
            SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) AS [Completed Lessons], 
            CAST(SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(LP.Id) AS DECIMAL(5,2)) AS [Coverage %] 
        FROM Grades G 
        JOIN Students S ON S.GradeId = G.Id 
        JOIN LessonPlans LP ON LP.GradeId = G.Id 
        JOIN Subjects Sub ON LP.SubjectId = Sub.Id 
        GROUP BY G.Name, Sub.Name;"
    },

    { "MissingLessonPlans",
      @"SELECT 
            T.Name AS [Teacher], 
            Sub.Name AS [Subject], 
            LP.Id AS [LessonPlanId], 
            LP.StartDate, 
            LP.EndDate 
        FROM LessonPlans LP 
        JOIN Teachers T ON LP.CreatedById = T.Id 
        JOIN Subjects Sub ON LP.SubjectId = Sub.Id 
        WHERE LP.Completed = 0 
          AND LP.EndDate < GETDATE() 
        ORDER BY T.Name, LP.StartDate;"
    }
};

        public static readonly string NamesAbbre = "[{\"OriginalName\":\"10th Grade (Sophomore)\",\"Abbreviations\":\"10th Grade (Sophomore),10th Grade,Gr. 10th,Gr 10,Grade 10,Tenth Grade,Sophomore\",\"Context\":\"Grade\"},{\"OriginalName\":\"11th Grade (Junior)\",\"Abbreviations\":\"11th Grade (Junior),11th Grade,Gr. 11th,Gr 11,Grade 11,Eleventh Grade,Junior\",\"Context\":\"Grade\"},{\"OriginalName\":\"12th Grade (Senior)\",\"Abbreviations\":\"12th Grade (Senior),12th Grade,Gr. 12th,Gr 12,Grade 12,Twelfth Grade,Senior\",\"Context\":\"Grade\"},{\"OriginalName\":\"1st Grade\",\"Abbreviations\":\"1st Grade,Gr. 1st,Gr 1,Grade 1,First Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"2nd Grade\",\"Abbreviations\":\"2nd Grade,Gr. 2nd,Gr 2,Grade 2,Second Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"3rd Grade\",\"Abbreviations\":\"3rd Grade,Gr. 3rd,Gr 3,Grade 3,Third Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"4th Grade\",\"Abbreviations\":\"4th Grade,Gr. 4th,Gr 4,Grade 4,Fourth Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"5th Grade\",\"Abbreviations\":\"5th Grade,Gr. 5th,Gr 5,Grade 5,Fifth Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"6th Grade\",\"Abbreviations\":\"6th Grade,Gr. 6th,Gr 6,Grade 6,Sixth Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"7th Grade\",\"Abbreviations\":\"7th Grade,Gr. 7th,Gr 7,Grade 7,Seventh Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"8th Grade\",\"Abbreviations\":\"8th Grade,Gr. 8th,Gr 8,Grade 8,Eighth Grade\",\"Context\":\"Grade\"},{\"OriginalName\":\"9th Grade (Freshman)\",\"Abbreviations\":\"9th Grade (Freshman),9th Grade,Gr. 9th,Gr 9,Grade 9,Ninth Grade,Freshman\",\"Context\":\"Grade\"},{\"OriginalName\":\"B.S. IT – 1st Semester\",\"Abbreviations\":\"B.S. IT – 1st Semester,BSIT 1st Sem,BS IT 1st Semester,BSIT Sem 1,B.S. Information Technology Semester 1,Bachelor of Science in IT 1st Semester,BSIT First Sem,BS IT First Semester,BSIT S1\",\"Context\":\"Grade\"},{\"OriginalName\":\"B.S. IT – 2nd Semester\",\"Abbreviations\":\"B.S. IT – 2nd Semester,BSIT 2nd Sem,BS IT 2nd Semester,BSIT Sem 2,B.S. Information Technology Semester 2,Bachelor of Science in IT 2nd Semester,BSIT Second Sem,BS IT Second Semester,BSIT S2\",\"Context\":\"Grade\"},{\"OriginalName\":\"Kindergarten\",\"Abbreviations\":\"Kindergarten,Kdg,Kinder,Grade K,Gr. K\",\"Context\":\"Grade\"},{\"OriginalName\":\"Algebra I\",\"Abbreviations\":\"Algebra I,Algebra 1,Alg I,Alg 1\",\"Context\":\"Subject\"},{\"OriginalName\":\"Algebra II\",\"Abbreviations\":\"Algebra II,Algebra 2,Alg II,Alg 2\",\"Context\":\"Subject\"},{\"OriginalName\":\"Art\",\"Abbreviations\":\"Art,Visual Arts,Arts\",\"Context\":\"Subject\"},{\"OriginalName\":\"Biology\",\"Abbreviations\":\"Biology,Bio,Life Biology\",\"Context\":\"Subject\"},{\"OriginalName\":\"Chemistry\",\"Abbreviations\":\"Chemistry,Chem. Sci\",\"Context\":\"Subject\"},{\"OriginalName\":\"Civics & Economics\",\"Abbreviations\":\"Civics & Economics,Civics and Econ,Civ & Econ,Civic Economics\",\"Context\":\"Subject\"},{\"OriginalName\":\"English I\",\"Abbreviations\":\"English I,English 1,Eng I,ELA I\",\"Context\":\"Subject\"},{\"OriginalName\":\"English II\",\"Abbreviations\":\"English II,English 2,Eng II,ELA II\",\"Context\":\"Subject\"},{\"OriginalName\":\"English III\",\"Abbreviations\":\"English III,English 3,Eng III,ELA III\",\"Context\":\"Subject\"},{\"OriginalName\":\"English IV\",\"Abbreviations\":\"English IV,English 4,Eng IV,ELA IV\",\"Context\":\"Subject\"},{\"OriginalName\":\"English Language Arts\",\"Abbreviations\":\"English Language Arts,ELA,Eng. Lang. Arts,Eng Language Arts\",\"Context\":\"Subject\"},{\"OriginalName\":\"Environmental Science\",\"Abbreviations\":\"Environmental Science,Env. Science,EnvSci,Environ Sci\",\"Context\":\"Subject\"},{\"OriginalName\":\"Geometry\",\"Abbreviations\":\"Geometry,Geom,Geo\",\"Context\":\"Subject\"},{\"OriginalName\":\"Government\",\"Abbreviations\":\"Government,Govt,Poli Sci,Political Science\",\"Context\":\"Subject\"},{\"OriginalName\":\"Mathematics\",\"Abbreviations\":\"Mathematics,Math,Maths\",\"Context\":\"Subject\"},{\"OriginalName\":\"Physical Science\",\"Abbreviations\":\"Physical Science,Phys Sci,Phy Science\",\"Context\":\"Subject\"},{\"OriginalName\":\"Physics\",\"Abbreviations\":\"Physics,Phys\",\"Context\":\"Subject\"},{\"OriginalName\":\"Pre-Calculus\",\"Abbreviations\":\"Pre-Calculus,PreCalc,Pre Calc,Advanced Algebra\",\"Context\":\"Subject\"},{\"OriginalName\":\"Science\",\"Abbreviations\":\"Science,Sci,Gen Science\",\"Context\":\"Subject\"},{\"OriginalName\":\"Social Studies\",\"Abbreviations\":\"Social Studies,Social Sci,Socials\",\"Context\":\"Subject\"},{\"OriginalName\":\"US History\",\"Abbreviations\":\"US History,U.S. History,American History,USA History\",\"Context\":\"Subject\"},{\"OriginalName\":\"World History\",\"Abbreviations\":\"World History,Wrld History,Global History\",\"Context\":\"Subject\"}]";

    };



}

