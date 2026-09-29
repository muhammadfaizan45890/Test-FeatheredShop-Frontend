import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API from '@/utils/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get email from query param (if passed after signup)
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResent, setIsResent] = useState(false);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`${API}/user/resend-verification`, { email });
      
      if (res.data.success) {
        toast.success(res.data.message || 'Verification email resent!');
        setIsResent(true);
        // Reset the resend flag after 5 seconds
        setTimeout(() => setIsResent(false), 5000);
      } else {
        setError(res.data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      console.error('Resend error:', err);
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Static background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full  opacity-40 mix-blend-multiply blur-3xl dark:opacity-20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full  opacity-40 mix-blend-multiply blur-3xl dark:opacity-20" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 sm:text-4xl">
              Verify your email
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              We've sent a verification link to your email address
            </p>
          </div>

          {/* Card */}
          <Card className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm ">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex justify-center mb-2">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-3">
                  <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center text-emerald-700 dark:text-emerald-400">
                Check your inbox
              </CardTitle>
              <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                Please click the verification link in the email we sent to verify your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isResent && (
                <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                  <AlertDescription className="text-emerald-800 dark:text-emerald-300">
                    Verification email resent successfully! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the email? Enter your email below and we'll send another one.
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                      if (isResent) setIsResent(false);
                    }}
                    placeholder="m@example.com"
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-colors disabled:opacity-60"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend verification email
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Verification link expired?{' '}
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-emerald-600 hover:underline font-medium disabled:opacity-50"
                >
                  Request a new one
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;