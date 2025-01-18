import { useState, useEffect } from "react";
import { Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
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
  const [messages, setMessages] = useState<Message[]>([]);

  console.log({ messages, conversations, selectedConversation, inputMessage });

  const fetchLLMResponse = async (prompt: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/llm", {
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

      console.log("This is the title for the new conversation", title);

      const response = await fetch(
        `http://localhost:3000/api/chat/conversations`,
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

      // Update state with the new conversation
      setConversations((prev) => [...prev, newConversation]);
      setSelectedConversation(newConversation);

      return newConversation;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      throw error;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Create user message with proper content structure
    const userMessage: Message = {
      id: `${Date.now()}`,
      content: inputMessage,
      senderType: "User",
      senderId: localStorage.getItem("userId") as string,
    };

    if (!selectedConversation) {
      const newConversation = await createNewConversation("New Conversation");
      setSelectedConversation({
        ...newConversation,
        messages: [userMessage],
      });
    } else {
      setSelectedConversation(
        (prev) =>
          prev && {
            ...prev,
            messages: [...prev.messages, userMessage],
          }
      );
    }

    try {
      const llmResponse = await fetchLLMResponse(inputMessage);
      const botMessage: Message = {
        id: `${Date.now() + 1}`,
        content: llmResponse,
        senderType: "System",
      };

      setSelectedConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));

      await sendMessageToConversation(selectedConversation?.id, [
        userMessage,
        botMessage,
      ]);
    } catch (error) {
      console.error("Error fetching LLM response:", error);
      // Create error message with proper content structure
      const errorMessage: Message = {
        id: `${Date.now() + 2}`,
        content:
          "Sorry, I couldn't process your request. Please try again later.",
        senderType: "System",
      };

      // Add error message to local state
      setMessages((prev) => [
        ...prev,
        {
          id: errorMessage.id,
          content: errorMessage.content,
          senderType: "System",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  //function for sending the LLM response to the backend and storing it

  const sendMessageToConversation = async (
    conversationId: string,
    content: Message[]
  ) => {
    try {
      // Retrieve token and user-id from localStorage
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Set headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "user-id": userId || "",
      };

      // Send the request using fetch
      const response = await fetch(
        `http://localhost:3000/api/chat/conversations/${conversationId}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ content }),
        }
      );

      // console.log("This is the response for sending the data to the backend", response)

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the selected conversation
      setSelectedConversation((prev) => ({
        ...prev,
        messages: [prev.messages, ...data.messages],
      }));

      // Update the conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, ...data.messages],
              }
            : conv
        )
      );

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
        `http://localhost:3000/api/chat/conversations`,
        {
          method: "GET",
          headers: headers,
        }
      ).then((response) => response.json());

      console.log("fetching convos", response);

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <Button onClick={handleLogout} className="ml-auto">
          Logout
        </Button>
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`p-2 rounded cursor-pointer ${
                selectedConversation?.id === conv.id
                  ? "bg-blue-400"
                  : "hover:bg-indigo-200"
              }`}
              onClick={() => {
                setSelectedConversation(conv);
              }}
            >
              {conv.id}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-4">
        {/* LLM Bot Chat */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Chat with the LLM Bot</h3>
          <div className="border rounded p-4 h-[80vh] overflow-y-auto">
            {selectedConversation &&
              selectedConversation.messages?.map((msg) => (
                <div key={msg.id}>
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === "System"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <strong>
                      {msg.senderType === "System" ? "Bot" : "You"}:
                    </strong>{" "}
                    {msg.content}? : {} ( )? as string{" "}
                  </div>
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
