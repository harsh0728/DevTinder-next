"use client"
import React from 'react'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addUser } from '@/store/slices/userSlice';
import { useAppDispatch } from '@/store/hooks';


const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  age: z.coerce.number().min(10, "Must be at least 10").max(100, "Invalid age"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage (){
  return (
    <div> signup page</div>
  )
}

