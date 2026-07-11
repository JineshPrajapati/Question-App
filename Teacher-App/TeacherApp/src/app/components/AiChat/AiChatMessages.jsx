import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { Send, Bot, User } from "lucide-react";


export const AiChatMessages = ({ onSendMessage }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isAiTyping, setIsAiTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const simulateAiResponse = (userMessage) => {
        setIsAiTyping(true);

        // Simulate AI processing time
        setTimeout(() => {
            const aiResponse = generateAiResponse(userMessage);
            const aiMessage = {
                id: Date.now().toString() + "_ai",
                content: "",
                sender: "ai",
                timestamp: new Date(),
                isTyping: true,
            };

            setMessages((prev) => [...prev, aiMessage]);
            setIsAiTyping(false);

            // Simulate typing effect
            let currentText = "";
            let charIndex = 0;

            const typingInterval = setInterval(() => {
                if (charIndex < aiResponse.length) {
                    currentText += aiResponse[charIndex];
                    charIndex++;

                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === aiMessage.id ? { ...msg, content: currentText } : msg
                        )
                    );
                } else {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === aiMessage.id ? { ...msg, isTyping: false } : msg
                        )
                    );
                    clearInterval(typingInterval);
                }
            }, 30); // typing speed
        }, 1000); // processing delay
    };

    const generateAiResponse = (userMessage) => {
        const responses = [
            "Based on your question, I can help you understand the curriculum scope for Class 6 science. The curriculum typically covers topics like basic physics concepts, introduction to chemistry, and fundamental biology principles.",
            "Great question! Let me provide you with a comprehensive summary of the chapter you mentioned. This will include key concepts, important definitions, and practical applications.",
            "I'd be happy to suggest learning objectives that align with educational standards. These objectives will help students develop critical thinking and problem-solving skills.",
            "Here are the key topics that students should focus on for better understanding and exam preparation. Each topic builds upon previous concepts and prepares students for advanced learning.",
            "I can generate a comprehensive assessment that includes multiple choice questions, short answer questions, and practical problems to evaluate student understanding.",
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        onSendMessage?.(inputValue);
        setInputValue("");

        // Simulate AI response
        simulateAiResponse(inputValue);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-subtle">
            {/* Chat Header */}
            <div className="p-4 border-b bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">AI Assistant</h2>
                        <p className="text-sm text-muted-foreground">
                            Ask anything using your documents!
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                        <p className="text-muted-foreground">
                            Ask me anything about your documents and I'll help you!
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                            } chat-message-enter`}
                    >
                        <div
                            className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""
                                }`}
                        >
                            <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border"
                                    }`}
                            >
                                {message.sender === "user" ? (
                                    <User className="w-4 h-4" />
                                ) : (
                                    <Bot className="w-4 h-4" />
                                )}
                            </div>

                            <Card
                                className={`p-3 ${message.sender === "user"
                                        ? "bg-primary text-primary-foreground border-primary/20"
                                        : "bg-card"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">
                                    {message.content}
                                    {message.isTyping && (
                                        <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                                    )}
                                </p>
                            </Card>
                        </div>
                    </div>
                ))}

                {isAiTyping && (
                    <div className="flex justify-start chat-message-enter">
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card border flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <Card className="p-3 bg-card">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                    <div
                                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                        style={{ animationDelay: "0.1s" }}
                                    />
                                    <div
                                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-card/80 backdrop-blur-sm">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask anything using your documents!"
                        className="flex-1"
                        disabled={isAiTyping}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isAiTyping}
                        className="gradient-primary"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Use Shift + Enter for new lines. 0 / 1000
                </p>
            </div>
        </div>
    );
}
