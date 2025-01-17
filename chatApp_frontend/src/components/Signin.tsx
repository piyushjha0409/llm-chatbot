import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';
import ErrorComponent from './ErrorComponent';


const SignInCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add state for error message


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in attempt with:', { email, password });

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 200) {
        // Redirect to /demo on successful login
        const data = await response.json();
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("token", data.token);
        window.location.href = "/demo";
      } else {

        setErrorMessage("Failed to authenticate. Please check your credentials.");
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (userId) {
      window.location.href = "/demo";
    }
  }, []);
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <ErrorComponent
            type="error"
            message={errorMessage}
            action={{
              label: "Try Again",
              onClick: () => {
                setErrorMessage(null); // Clear the error message
              }
            }}
            onDismiss={() => setErrorMessage(null)} // Dismiss the error
          />
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:text-blue-700">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInCard;
