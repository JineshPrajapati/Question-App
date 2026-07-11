import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  BookOpen,
  Target,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../ui/Button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react"; // icon for export
import autoTable from "jspdf-autotable";

const LessonPlanTable = ({ lessonPlans }) => {
  return (
    <div className="h-full max-h-full flex-1 space-y-6 overflow-auto rounded bg-gradient-to-br from-slate-50 to-blue-50 p-4 pb-20">
      {/* <div className="mb-8 text-center">
        <h1 className="bg-gradient-grading mb-2 bg-clip-text text-4xl font-bold text-transparent">
          Lesson Plan Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive educational planning across grading periods
        </p>
      </div> */}

      <div className="space-y-6">
        {lessonPlans.map((plan, index) => (
          <GradingPeriodCard key={index} plan={plan} />
        ))}
      </div>
    </div>
  );
};

const GradingPeriodCard = ({ plan }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="animate-fade-in overflow-hidden border-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            style={
              {
                // backgroundImage:
                //   "linear-gradient(135deg, hsl(210, 100%, 40%) 0%, hsl(210, 90%, 50%) 100%)",
              }
            }
            className="bg-primary cursor-pointer text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-white hover:bg-white/20"
                >
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {plan.Grading_Period}
                  </CardTitle>
                  <p className="mt-1 text-white/80">{plan.Domain_Title}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-white/90">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {format(new Date(plan.Start_Date), "MMM dd")} -{" "}
                    {format(new Date(plan.End_Date), "MMM dd, yyyy")}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="mt-2 border-white/30 bg-white/20 text-white"
                >
                  {plan.Weeks_Consider} weeks
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-muted-foreground mb-2 flex items-center text-sm font-semibold">
                    <BookOpen className="mr-1 h-4 w-4" />
                    Topics Covered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.Topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-muted-foreground mb-2 flex items-center text-sm font-semibold">
                    <Target className="mr-1 h-4 w-4" />
                    Standards
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.Standards.map((standard, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {plan.MonthlyPlans.map((month, monthIndex) => (
                  <MonthCard key={monthIndex} month={month} />
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const MonthCard = ({ month }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="rounded border-l-1 border-gray-400">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            // style={{
            //   backgroundImage:
            //     "linear-gradient(135deg, hsl(42 100% 50%) 0%, hsl(42 90% 60%) 100%)",
            // }}
            className="cursor-pointer bg-[#336d91] text-white transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-white hover:bg-white/20"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div>
                  <CardTitle className="text-xl">{month.Month}</CardTitle>
                  <p className="text-sm text-white/80">{month.Domain_Title}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {month.Topics.map((topic, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-white/30 bg-white/20 text-xs text-white"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="animate-slide-in space-y-3 p-4">
            {month.WeeklyPlans.map((week, weekIndex) => (
              <WeekCard key={weekIndex} week={week} />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const WeekCard = ({ week }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleExportWeekPDF = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    let y = 20;

    // ===== HEADER BAR =====
    pdf.setFillColor(27, 154, 65); // green
    pdf.rect(0, 0, pageWidth, 18, "F");

    pdf.setTextColor(255, 255, 255).setFontSize(14).setFont(undefined, "bold");
    pdf.text(`Week ${week.Week} - ${week.Domain_Title}`, margin, 12);

    pdf.setFontSize(11).setFont(undefined, "normal");
    pdf.text(
      `${format(new Date(week.Start_Date), "MMM dd")} - ${format(new Date(week.End_Date), "MMM dd")}`,
      pageWidth - margin - 40,
      12,
    );

    y = 25; // move down

    // ===== BADGE DRAW FUNCTION =====
    const drawBadges = (title, items) => {
      pdf.setFontSize(11).setFont(undefined, "bold").setTextColor(0);
      pdf.text(title, margin, y);
      y += 6;

      let x = margin;
      pdf.setFont(undefined, "normal").setFontSize(10);

      items.forEach((item) => {
        const badgeWidth = pdf.getTextWidth(item) + 6;
        if (x + badgeWidth > pageWidth - margin) {
          // move to new line
          x = margin;
          y += 6;
        }
        pdf.setDrawColor(0);
        pdf.roundedRect(x, y - 4, badgeWidth, 6, 1, 1); // rounded border
        pdf.text(item, x + 3, y);
        x += badgeWidth + 3;
      });
      y += 8;
    };

    // ===== METADATA =====
    drawBadges("Topics", week.Topics);
    drawBadges("Materials", week.Materials);
    drawBadges("Activities", week.Activities);

    // ===== SEPARATOR =====
    pdf.setDrawColor(200);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;

    // ===== DAY-WISE LESSONS =====
    const addField = (label, value) => {
      const wrappedLabel = pdf.splitTextToSize(
        `${label}:`,
        pageWidth - margin * 2,
      );
      const labelHeight = pdf.getTextDimensions(wrappedLabel).h;
      const wrappedValue = pdf.splitTextToSize(
        value || "-",
        pageWidth - margin * 2,
      );
      const valueHeight = pdf.getTextDimensions(wrappedValue).h;
      const blockHeight = labelHeight + valueHeight + 2;

      if (y + blockHeight > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFont(undefined, "bold");
      pdf.text(wrappedLabel, margin, y);
      y += labelHeight;
      pdf.setFont(undefined, "normal");
      pdf.text(wrappedValue, margin, y);
      y += valueHeight + 2;
    };

    week.DailyPlans.forEach((day, index) => {
      if (y + 12 > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFillColor(41, 128, 185);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12).setFont(undefined, "bold");
      pdf.rect(margin, y, pageWidth - margin * 2, 8, "F");
      pdf.text(
        `Day ${index + 1} - ${day.Day} (${format(new Date(day.Actual_Date), "MMM dd, yyyy")})`,
        margin + 2,
        y + 6,
      );
      y += 12;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      addField("Lesson Title", day.Lesson_Title);
      addField("Objectives", day.Objectives.join(", "));
      addField("Materials", day.Materials_Resources_Needed.join(", "));
      addField("Anticipatory Set", day.Anticipatory_Set);
      addField("Input", day.Input);
      addField("Model", day.Model);
      addField("Guided Practice", day.Guided_Practice);
      addField("Independent Practice", day.Independent_Practice);
      addField("Closure", day.Closure);
      pdf.setDrawColor(200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;
    });

    // Footer
    pdf.setFontSize(8).setTextColor(100);
    pdf.text(
      `Generated on ${format(new Date(), "MMM dd, yyyy")}`,
      margin,
      pdf.internal.pageSize.getHeight() - 5,
    );

    pdf.save(`${week.Week}-lesson-plans.pdf`);
  };

  return (
    <Card className="shadow-soft border-l-1 border-gray-400">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            // style={{
            //   backgroundImage:
            //     "linear-gradient(135deg, hsl(142 76% 36%) 0%, hsl(142 76% 36%) 100%)",
            // }}
            className="cursor-pointer bg-[#4a82a7] py-3 text-white transition-all duration-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-white hover:bg-white/20"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
                <div>
                  <CardTitle className="text-lg">{week.Week}</CardTitle>
                  <p className="text-sm text-white/80">{week.Domain_Title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-white/90">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(week.Start_Date), "MMM dd")} -{" "}
                    {format(new Date(week.End_Date), "MMM dd")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent collapsing
                    handleExportWeekPDF();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4">
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <h5 className="text-muted-foreground mb-2 flex items-center text-sm font-medium">
                  <BookOpen className="mr-1 h-3 w-3" />
                  Topics
                </h5>
                <div className="flex flex-wrap gap-1">
                  {week.Topics.map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-muted-foreground mb-2 flex items-center text-sm font-medium">
                  <Package className="mr-1 h-3 w-3" />
                  Materials
                </h5>
                <div className="flex flex-wrap gap-1">
                  {week.Materials.slice(0, 3).map((material, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                  {week.Materials.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{week.Materials.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-muted-foreground mb-2 flex items-center text-sm font-medium">
                  <Target className="mr-1 h-3 w-3" />
                  Activities
                </h5>
                <div className="flex flex-wrap gap-1">
                  {week.Activities.slice(0, 2).map((activity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {activity}
                    </Badge>
                  ))}
                  {week.Activities.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{week.Activities.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {week.DailyPlans.map((day, dayIndex) => (
                <DayCard key={dayIndex} day={day} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const DayCard = ({ day }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportTablePDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text(`Lesson Plan - ${day.Day}`, 14, 15);

    autoTable(pdf, {
      startY: 25,
      head: [["Field", "Details"]],
      body: [
        ["Lesson Title", day.Lesson_Title],
        ["Date", format(new Date(day.Actual_Date), "MMM dd, yyyy")],
        ["Objectives", day.Objectives.join("\n")],
        ["Materials & Resources", day.Materials_Resources_Needed.join("\n")],
        ["Anticipatory Set", day.Anticipatory_Set],
        ["Input", day.Input],
        ["Model", day.Model],
        ["Guided Practice", day.Guided_Practice],
        ["Independent Practice", day.Independent_Practice],
        ["Closure", day.Closure],
      ],
      styles: {
        cellWidth: "wrap",
        fontSize: 10,
        valign: "top",
      },
      headStyles: {
        fillColor: [41, 128, 185], // blue header
        textColor: 255,
      },
    });

    pdf.save(`${day.Day}-lesson-plan.pdf`);
  };

  return (
    <Card className="border-gray-400-info rounded-sm border-l-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            // style={{
            //   backgroundImage:
            //     "linear-gradient(135deg,hsl(199 89% 48%) 0%, hsl(199 79% 58%) 100%)",
            // }}
            className="cursor-pointer bg-[#6696b5] py-2 text-white transition-all duration-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-white hover:bg-white/20"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
                <div>
                  <CardTitle className="text-base">{day.Day}</CardTitle>
                  <p className="text-sm text-white/80">{day.Lesson_Title}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-sm text-white/90">
                  {format(new Date(day.Actual_Date), "MMM dd")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportTablePDF();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h6 className="text-muted-foreground mb-2 flex items-center text-sm font-medium">
                  <Target className="mr-1 h-3 w-3" />
                  Learning Objectives
                </h6>
                <ul className="space-y-1 text-sm">
                  {day.Objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="bg-education-primary mt-2 mr-2 h-2 w-2 flex-shrink-0 rounded-full"></span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h6 className="text-muted-foreground mb-2 flex items-center text-sm font-medium">
                  <Package className="mr-1 h-3 w-3" />
                  Materials & Resources
                </h6>
                <div className="flex flex-wrap gap-1">
                  {day.Materials_Resources_Needed.map((material, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <h6 className="text-muted-foreground mb-1 font-medium">
                    Anticipatory Set
                  </h6>
                  <p className="bg-muted rounded p-2 text-sm">
                    {day.Anticipatory_Set}
                  </p>
                </div>
                <div>
                  <h6 className="text-muted-foreground mb-1 font-medium">
                    Input
                  </h6>
                  <p className="bg-muted rounded p-2 text-sm">{day.Input}</p>
                </div>
                <div>
                  <h6 className="text-muted-foreground mb-1 font-medium">
                    Model
                  </h6>
                  <p className="bg-muted rounded p-2 text-sm">{day.Model}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h6 className="text-muted-foreground mb-1 font-medium">
                    Guided Practice
                  </h6>
                  <p className="bg-muted rounded p-2 text-sm">
                    {day.Guided_Practice}
                  </p>
                </div>
                <div>
                  <h6 className="text-muted-foreground mb-1 font-medium">
                    Independent Practice
                  </h6>
                  <p className="bg-muted rounded p-2 text-sm">
                    {day.Independent_Practice}
                  </p>
                </div>
                <div>
                  <h6 className="text-muted-foreground mb-1 font-medium">
                    Closure
                  </h6>
                  <p className="bg-muted rounded p-2 text-sm">{day.Closure}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default LessonPlanTable;
