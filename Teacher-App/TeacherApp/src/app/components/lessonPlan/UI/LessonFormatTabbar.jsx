import { useIsMobile } from "../../../hooks/useMobile";

const LessonFormatTabbar = ({ lessonFormatType, setLessonFormatType }) => {
  const isMobile = useIsMobile();
  const tabs = ["Yearly", "Monthly", "Weekly", "Daily"];
  const TabComponent = ({ label, index }) => {
    return (
      <div
        onClick={() => {
          setLessonFormatType(index);
        }}
        className={`flex h-10 cursor-pointer items-center justify-center rounded-lg ${index == lessonFormatType ? "bg-primary" : "border-primary text-primary border bg-gray-100"} `}
      >
        {label}
      </div>
    );
  };
  return (
    <div className="grid w-full grid-cols-4 space-x-2">
      {tabs.map((tab, idx) => (
        <TabComponent key={idx} label={tab} index={idx} />
      ))}
    </div>
  );
};

export default LessonFormatTabbar;
