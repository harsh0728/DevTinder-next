"use client"
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addUser } from '@/store/slices/userSlice';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react'
import z from 'zod';

const loginSchema=z.object({
  email:z.email("Invalid email address"),
  password:z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm=z.infer<typeof loginSchema>

export default function page() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const dispatch=useAppDispatch();
  const currentUser=useAppSelector((state)=>state.user.user)
  const router=useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      const response = await login(data);
      if (response.success && response.data) {
        dispatch(addUser(response.data));
        router.push('/feed');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary">
            DevTinder
          </h1>
          <p className="text-center text-base-content/70">
            Login to connect with developers
          </p>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                {...register('password')}
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center">
            <a href="/signup" className="link link-primary">
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

