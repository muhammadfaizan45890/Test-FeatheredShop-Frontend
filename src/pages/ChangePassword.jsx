import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API from '@/utils/api';

const ChangePassword = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const checkPasswordStrength = (password) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const score = Object.values(strength).filter(Boolean).length;
    setPasswordStrength({ score, ...strength });
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    checkPasswordStrength(value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 2) return 'bg-red-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getPasswordStrengthText = () => {
    const { score } = passwordStrength;
    if (score <= 2) return 'Weak';
    if (score === 3) return 'Fair';
    if (score === 4) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (passwordStrength.score < 3) {
      setError('Password is too weak. Use uppercase, lowercase, number, or special character.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const res = await axios.post(`${API}/user/change-password/${email}`, {
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        setSuccess(res.data.message || 'Password changed successfully!');
        toast.success('Password updated! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(res.data.message || 'Failed to change password');
      }
    } catch (err) {
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
              Create new password
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Set a strong password for{' '}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {email ? decodeURIComponent(email) : 'your account'}
              </span>
            </p>
          </div>

          <Card className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm ">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center text-emerald-700 dark:text-emerald-400">
                Change password
              </CardTitle>
              <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                Your new password must be different from previous ones
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                    <AlertDescription className="text-emerald-800 dark:text-emerald-300">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New password
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      placeholder="Enter new password"
                      className="pr-10 border-gray-200 dark:border-gray-700 focus:border-emerald-400 focus:ring-emerald-400/20"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength.score <= 2
                              ? 'text-red-600'
                              : passwordStrength.score === 3
                              ? 'text-yellow-600'
                              : passwordStrength.score === 4
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                        <div className="flex items-center gap-1">
                          {passwordStrength.hasMinLength ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-500">≥8 chars</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {passwordStrength.hasUppercase ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-500">Uppercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {passwordStrength.hasLowercase ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-500">Lowercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {passwordStrength.hasNumber ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-500">Number</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          {passwordStrength.hasSpecialChar ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-500">Special char (!@#$...)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Re-enter your password"
                      className="pr-10 border-gray-200 dark:border-gray-700 focus:border-emerald-400 focus:ring-emerald-400/20"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing password...
                    </>
                  ) : (
                    'Change password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;