import React, { useContext, useEffect, useState, useRef } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ChevronLeft,User,Bot,ChevronRight, Clock, MessageSquare } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { getAiAssistenHistory } from "../../../api/services/aiAssistentService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";


const ITEMS_PER_PAGE = 8;

const parseTimestamp = (timestamp) => {
    const [datePart, timePart, meridiem] = timestamp.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    let hour24 = parseInt(hours);
    if (meridiem === 'PM' && hour24 !== 12) hour24 += 12;
    if (meridiem === 'AM' && hour24 === 12) hour24 = 0;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minutes));
};

const getTimeGroup = (timestamp) => {
    const date = parseTimestamp(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isThisWeek(date)) return "This Week";
    if (isThisMonth(date)) return "This Month";
    const now = new Date();
    const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (monthsDiff === 1) return "Last Month";
    if (monthsDiff <= 3) return "Last 3 Months";
    if (monthsDiff <= 6) return "Last 6 Months";
    return "Older";
};

const groupChatHistory = (items) => {
    const groups = {};
    const groupOrder = ["Today", "Yesterday", "This Week", "This Month", "Last Month", "Last 3 Months", "Last 6 Months", "Older"];

    items.forEach(item => {
        const group = getTimeGroup(item.timestamp);
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
    });
    Object.keys(groups).forEach(group => {
        groups[group].sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp));
    });
    return groupOrder.filter(group => groups[group]).map(group => ({ title: group, items: groups[group] }));
};

export const AiChatHistory = ({ onItemSelect }) => {

    const {
        user: userData,
        currSelectedSchool,
        currSelectedAcademicYear,
    } = useContext(AuthContext);

    const [currentPage, setCurrentPage] = useState(1);
    const [groupedHistory, setGroupedHistory] = useState([]);


    const { data: userChatHistory, isLoading: userChatHistoryloading } =
        useQuery({
            queryKey: [
                "userChatHistory",
                currSelectedSchool,
                currSelectedAcademicYear,
            ],
            queryFn: () =>
                getAiAssistenHistory({
                    academicYearId: parseInt(currSelectedAcademicYear),              
                    userId: userData.userId || "",
                    schoolId: parseInt(currSelectedSchool || 0),
                    pageSize : -1,
                    offset : 0
                }),
        });

 



    useEffect(() => {
        if (userChatHistory) {
          
            const chatHistory = userChatHistory.data;
            const chatHistoryItems =   groupChatHistory(chatHistory);
            setGroupedHistory(chatHistoryItems);
           
        }
      
    }, [userChatHistory]);

   

    const flattenedItems = groupedHistory.flatMap(group => group.items.map(item => ({ ...item, groupTitle: group.title })));
    const totalPages = Math.ceil(flattenedItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = flattenedItems.slice(startIndex, endIndex);
    const currentGroupedItems = currentItems.reduce((acc, item) => {
        const groupTitle = item.groupTitle;
        if (!acc[groupTitle]) acc[groupTitle] = [];
        acc[groupTitle].push(item);
        return acc;
    }, {});



    const getCategoryColor = (category) => {
        const colors = {
            Curriculum: "bg-blue-100 text-blue-800 hover:bg-blue-200",
            Summary: "bg-green-100 text-green-800 hover:bg-green-200",
            Objectives: "bg-purple-100 text-purple-800 hover:bg-purple-200",
            Topics: "bg-orange-100 text-orange-800 hover:bg-orange-200",
            Assessment: "bg-red-100 text-red-800 hover:bg-red-200"
        };
        return colors[category];
    };

    return (
        <div className="w-65 bg-card  h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Search History
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {Object.entries(currentGroupedItems).map(([groupTitle, items]) => (
                    <div key={groupTitle} className="mb-6">
                        <div className="sticky top-0 bg-card/95 backdrop-blur-sm py-2 mb-3 border-b border-border/30">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {groupTitle}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {items.map((item) => (
                                <Card
                                    key={item.id}
                                    className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition duration-200 
            hover:shadow-md hover:border-primary/50 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onItemSelect?.(item)}
                                >
                                    <div className="flex flex-col h-full justify-between">
                                    
                                        <div className="w-full text-sm font-medium text-gray-800 leading-relaxed mb-2 line-clamp-2 prose prose-sm max-w-none text-left">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {item.lastMessagePreview || ""}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                                                {item.lastSender === "user" ? (
                                                    <User className="w-3 h-3" />
                                                ) : (
                                                    <Bot className="w-3 h-3" />
                                                )}
                                                {item.lastSender === "user" ? "You" : "AI"}
                                            </span>

                                            <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {item.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}

                {currentGroupedItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No chat history yet</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-sm text-muted-foreground">{currentPage} of {totalPages}</span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
