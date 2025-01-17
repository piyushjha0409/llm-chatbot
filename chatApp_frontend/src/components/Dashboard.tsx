import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { redirect } from 'react-router-dom';

// Define the structure for a single chat message (either user or bot)
interface Message {
    id: string;
    text: string;
    isBot: boolean;
}

// Define the structure for the chat data from the backend
interface Chat {
    id: string;
    userMessage: string;
    botMessage: string;
    createdAt: string;
    userId: string;
}


const Dashboard = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Hello! How can I help you today?", isBot: true },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    //function for fetching the chats from the backend 
    const fetchChats = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/chat?userId=${userId}`, {
                method: "GET",
            });

            const data: Chat[] = await response.json();

            if (!response.ok) {
                throw new Error("Failed to fetch chats");
            }

            const formattedChats: Message[] = data.map((chat: Chat) => [
                { id: chat.id, text: chat.userMessage, isBot: false },
                { id: chat.id, text: chat.botMessage, isBot: true },
            ]).flat();

            setMessages(formattedChats);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    const userId = localStorage.getItem("userId");
    useEffect(() => {
        if (userId) {
            fetchChats(userId);
        } else {
            redirect("/");
        }
    }, []);

    //function for getting the llm response 
    const fetchLLMResponse = async (prompt: string) => {
        try {
            // Validate input
            if (!prompt) {
                throw new Error("Prompt is required.");
            }

            // Call the backend API
            const response = await fetch("http://localhost:3000/api/llm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            // Parse the JSON response
            const data = await response.json();

            // Handle errors returned by the server
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch LLM response");
            }

            // Return the LLM response
            return data.message;
        } catch (error) {
            console.error("Error fetching LLM response:", error);
            throw error; // Re-throw error for further handling if needed
        }
    };

    //function for saving the messages 
    const saveMessages = async (userMessage: string, botMessage: string) => {
        try {
            const userId = localStorage.getItem("userId")
            await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userMessage,
                    botMessage,
                    userId: userId
                }),
            });
        } catch (error) {
            console.error("Error saving messages to the database:", error);
        }
    };

    //function for sending the data to the backend 
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage: Message = { id: `${messages.length + 1}`, text: inputMessage, isBot: false };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');

        try {
            const llmResponse = await fetchLLMResponse(inputMessage);

            console.log("response from llm", llmResponse);
            const botMessage: Message = {
                id: `${messages.length + 2}`,
                text: llmResponse,
                isBot: true,
            };

            setMessages((prev) => [...prev, botMessage]);

            // Save the messages to the database
            saveMessages(userMessage.text, botMessage.text);
        } catch (error) {
            console.log(error)
            const errorMessage: Message = {
                id: `${messages.length + 2}`,
                text: "Sorry, I couldn't process your request. Please try again later.",
                isBot: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    //function for logout 
    const handleLogout = () => {
        localStorage.removeItem("userId");
        window.location.href = "/";
    }


    return (
        <div className="h-screen w-full max-w-2xl mx-auto">
            <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Chat Assistant</h2>
                    <Button onClick={handleLogout} className="ml-auto">Logout</Button> {/* Logout Button */}
                </div>

                {/* Messages Area */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${message.isBot
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'bg-blue-600 text-white'
                                    }`}
                            >
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>

                {/* Input Area */}
                <div className="p-4 border-t">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1"
                        />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;