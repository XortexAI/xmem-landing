import { useState, useEffect, useCallback } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/sections/Navbar';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SetUsername() {
  const { isAuthenticated, isLoading: isAuthLoading, user, token, setUsername, hasUsername } = useAuth();
  const [, setLocation] = useLocation();

  const [usernameInput, setUsernameInput] = useState('');
  const debouncedUsername = useDebounce(usernameInput, 500);
  
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If not authenticated, let ProtectedRoute handle it (or just redirect here to be safe)
  if (!isAuthLoading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // If they already have a username, they shouldn't be here
  if (!isAuthLoading && hasUsername) {
    return <Redirect to="/dashboard" />;
  }

  const checkAvailability = useCallback(async (username: string) => {
    // Basic validation
    if (!username) {
      setValidationError(null);
      setIsAvailable(null);
      return;
    }
    
    if (username.length < 3) {
      setValidationError("Username must be at least 3 characters long");
      setIsAvailable(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setValidationError("Username can only contain letters, numbers, and underscores");
      setIsAvailable(false);
      return;
    }

    setValidationError(null);
    setIsChecking(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/check-username/${username}`);
      if (response.ok) {
        const data = await response.json();
        setIsAvailable(data.available);
        if (!data.available) {
          setValidationError("This username is already taken");
        }
      } else {
        setValidationError("Failed to check availability");
        setIsAvailable(null);
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setValidationError("Failed to check availability");
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedUsername) {
      checkAvailability(debouncedUsername);
    }
  }, [debouncedUsername, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || isChecking || !usernameInput) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const success = await setUsername(usernameInput);
      if (success) {
        // Redirect to dashboard or previous page
        setLocation('/dashboard');
      } else {
        setSubmitError("Failed to set username. Please try again.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Set Your Username
            </h1>
            <p className="text-gray-400">
              Choose a unique username to identify yourself in XMem
            </p>
          </div>

          <Card className="bg-[#111] border-gray-800">
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl text-white">Choose Username</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {submitError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. xmem_user_123"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="bg-[#1a1a1a] border-gray-700 text-white focus-visible:ring-primary pr-10"
                      disabled={isSubmitting}
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {isChecking && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                      {!isChecking && isAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {!isChecking && isAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  
                  {validationError && (
                    <p className="text-sm text-red-400 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationError}
                    </p>
                  )}
                  
                  {!validationError && isAvailable === true && (
                    <p className="text-sm text-green-400 flex items-center mt-1">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Username is available!
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!isAvailable || isChecking || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Confirm Username"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
