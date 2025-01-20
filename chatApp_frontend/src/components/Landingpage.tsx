import Header from "./Header";
import Footer from "./Footer";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const Landingpage = () => {
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (userId) {
      window.location.href = "/demo";
    }
  }, [userId]);

  return (
    <div>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl text-black font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      Experience the Power of AI Conversations
                    </h1>
                    <p className="max-w-[600px] text-black md:text-xl dark:text-gray-400">
                      Engage with our advanced AI chatbot for intelligent
                      conversations, instant answers, and personalized
                      assistance.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link
                      to="/register"
                      className="inline-flex h-12 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-gray-50 transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                      to="/demo"
                      className="inline-flex h-12 items-center justify-center rounded-md border border-gray-200 bg-white px-6 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                    >
                      Try Demo
                    </Link>
                  </div>
                </div>
                <div className="mx-auto flex items-center justify-center">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                          <Bot className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                        </div>
                        <div className="flex-1 text-black rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
                          <p className="text-sm">
                            Hello! How can I assist you today?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                          <MessageSquare className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1 text-blaxk rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
                          <p className="text-sm">
                            Can you help me understand machine learning?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                          <Bot className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                        </div>
                        <div className="flex-1 text-black rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
                          <p className="text-sm">
                            Of course! Machine learning is a branch of
                            artificial intelligence...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Powerful AI Features
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Experience the next generation of conversational AI with our
                  advanced features
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
                <div className="flex flex-col items-center space-y-4 text-center">
                  <Sparkles className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                  <h3 className="text-xl font-bold">Natural Conversations</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Engage in fluid, context-aware conversations that feel
                    natural and intuitive.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 text-center">
                  <Zap className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                  <h3 className="text-xl font-bold">Instant Responses</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get immediate, accurate answers to your questions with our
                    advanced AI.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 text-center">
                  <Shield className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                  <h3 className="text-xl font-bold">Secure & Private</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your conversations are protected with enterprise-grade
                    security.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Landingpage;
