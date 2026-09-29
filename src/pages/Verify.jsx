import API from '@/utils/api';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Loader2, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const verifyEmail = async (retryToken = token) => {
    if (!retryToken) {
      setStatus('error');
      setMessage('Invalid verification link');
      setError('No verification token provided.');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('verifying');
    setMessage('Verifying your email...');

    try {
      const res = await axios.post(
        `${API}/user/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${retryToken}`,
          },
        }
      );

      if (res.data.success) {
        setStatus('success');
        setMessage('✅ Email verified successfully!');
        toast.success('Email verified! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus('error');
        setMessage('❌ Invalid or expired verification link');
        setError(res.data.message || 'The verification token is invalid or has expired.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      const errorMsg =
        err.response?.data?.message || 'Verification failed. Please try again.';
      setStatus('error');
      setMessage('❌ Verification failed');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRetry = () => {
    verifyEmail();
  };

  const getIcon = () => {
    if (status === 'success') return <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />;
    if (status === 'error') return <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />;
    return <Loader2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-spin" />;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden  dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
              Email Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {status === 'success'
                ? 'Your email has been confirmed'
                : status === 'error'
                ? 'Verification problem'
                : 'Please wait while we verify your account'}
            </p>
          </div>

          {/* Card */}
          <Card className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm ">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex justify-center mb-2">{getIcon()}</div>
              <CardTitle className="text-2xl text-center text-emerald-700 dark:text-emerald-400">
                {status === 'success' && 'Success!'}
                {status === 'error' && 'Verification Failed'}
                {status === 'verifying' && 'Verifying...'}
              </CardTitle>
              <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                {message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    The verification link may have expired or is invalid.
                    You can request a new verification email below.
                  </p>
                  <Button
                    onClick={handleRetry}
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
                        Resend verification link
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-center pt-2">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Verify;