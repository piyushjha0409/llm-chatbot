import { useState, useEffect } from "react";
import { Plus, Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id?: string;
  content: string;
  senderId?: string;
  senderType: "User" | "System";
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const Dashboard = () => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  // const [messages, setMessages] = useState<Message[]>([]);

  console.log({ selectedConversation });

  const fetchLLMResponse = async (prompt: string) => {
    try {
      const response = await fetch("https://llm-chatbot-6rx6.onrender.com/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error fetching LLM response:", error);
      throw error;
    }
  };

  //create new conversation
  const createNewConversation = async (title: string) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (userId) headers["user-id"] = userId;

      const response = await fetch(
        `/chat/conversations`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ title, userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create a new conversation");
      }

      const newConversation = await response.json();

      console.log({ newConversation });

      setConversations((prev) => [...prev, newConversation]);
      setSelectedConversation(newConversation);

      return newConversation;
    } catch (error) {
      alert(`Error creating new conversation: ${error}`);
      throw error;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const userMessage: Message = {
        content: inputMessage,
        senderType: "User",
        senderId: localStorage.getItem("userId") as string,
      };

      let newConversation: Conversation | undefined;

      if (!selectedConversation?.id) {
        newConversation = await createNewConversation(inputMessage);
      }

      setSelectedConversation((prev) => ({
        id: newConversation?.id ?? prev?.id ?? "",
        title: prev?.title ? prev.title : "New Chat",
        messages: [...(prev?.messages ?? []), userMessage],
      }));

      setInputMessage("");

      const llmResponse = await fetchLLMResponse(inputMessage);
      const botMessage: Message = {
        content: llmResponse,
        senderType: "System",
      };

      setSelectedConversation((prev) => ({
        id: prev?.id ?? "",
        title: prev?.title ?? "New Chat",
        messages: [...(prev?.messages ?? []), botMessage],
      }));

      await sendMessageToConversation(
        newConversation?.id ?? selectedConversation?.id ?? "",
        [userMessage, botMessage]
      );
    } catch (error) {
      alert(`Error fetching LLM response: ${error}`);
    }
  };

  const sendMessageToConversation = async (
    conversationId: string,
    content: Message[]
  ) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      console.log("This is the content", content);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "user-id": userId || "",
      };

      const response = await fetch(
        `https://llm-chatbot-6rx6.onrender.com/api/chat/conversations/${conversationId}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      await response.json();
      console.log("selectedConversation", selectedConversation);
      console.log("Conversations", conversations);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      };

      if (userId !== null) {
        headers["user-id"] = userId;
      }

      const response = await fetch(
        `https://llm-chatbot-6rx6.onrender.com/api/chat/conversations`,
        {
          method: "GET",
          headers: headers,
        }
      ).then((response) => response.json());

      setConversations(response);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  //fetch function
  const fetchMessages = async (conversation: Conversation) => {
    try {
      const token = localStorage.getItem("token");
      const conversationId = conversation.id;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `https://llm-chatbot-6rx6.onrender.com/api/chat/conversations/${conversationId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const result = await response.json();

      console.log("result ", result);

      setSelectedConversation({
        id: result.conversationId,
        title: result.conversationId,
        messages: result.messages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col justify-between">
        <div>
          <div className="flex flex-row justify-between">
            <h2 className="text-xl font-bold mb-4">Conversations</h2>
            <Button onClick={() => setSelectedConversation(null)}>
              <Plus />
            </Button>
          </div>
          <ul>
            {conversations.reverse().map((conv: Conversation) => (
              <li
                key={conv.id}
                className={`p-2 rounded cursor-pointer ${
                  selectedConversation?.id === conv.id
                    ? "bg-blue-400"
                    : "hover:bg-indigo-200"
                }`}
                onClick={async () => {
                  await fetchMessages(conv);
                }}
              >
                {conv.title}
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={handleLogout} className="w-full">
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-4">
        {/* LLM Bot Chat */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Chat with the LLM Bot</h3>
          <div className="border rounded p-4 h-[80vh] overflow-y-auto">
            {selectedConversation &&
              selectedConversation.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderType === "System"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <p
                    className={`text-white rounded-2xl p-2 ${
                      msg.senderType === "System"
                        ? "bg-gray-900"
                        : "bg-blue-500"
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              ))}
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
