import { Bot } from 'lucide-react'
import { Link } from 'react-router-dom'


const Header = () => {
    return (
        <div>
            <header className="px-4 lg:px-6 h-16 flex items-center border-b">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <Bot className="h-6 w-6" />
                    <span>AI Chat</span>
                </Link>
                <nav className="ml-auto flex gap-2 sm:gap-4">
                    <Link
                        to="/sign-in"
                        className="inline-flex text-black h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex text-black h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                    >
                        Register
                    </Link>
                </nav>
            </header>
        </div>
    )
}

export default Header