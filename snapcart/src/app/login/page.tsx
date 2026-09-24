'use client'

import React, { FormEvent, useState } from 'react'
import { EyeIcon, EyeOff, Leaf, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import googleImage from '@/assets/google-logo.png'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const formValidation =
        email.trim() !== '' && password.trim() !== ''

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()

        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                alert('Invalid email or password')
                return
            }

            router.push('/')
        } catch (error) {
            console.error('Error logging in:', error)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold text-green-700 mb-2"
            >
                Welcome Back
            </motion.h1>

            <p className="text-gray-600 mb-8 flex items-center">
                Login to snapcart
                <Leaf className="w-5 h-5 ml-2 text-green-600" />
            </p>

            <motion.form
                onSubmit={handleLogin}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-5 w-full max-w-sm"
            >
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {showPassword ? (
                        <EyeOff
                            className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(false)}
                        />
                    ) : (
                        <EyeIcon
                            className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(true)}
                        />
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!formValidation || loading}
                    className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                        formValidation
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Login'
                    )}
                </button>

                <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                    <span className="flex-1 h-px bg-gray-200"></span>
                    OR
                    <span className="flex-1 h-px bg-gray-200"></span>
                </div>

                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200"
                >
                    <Image
                        src={googleImage}
                        width={20}
                        height={20}
                        alt="Google"
                    />
                    Continue with Google
                </button>
            </motion.form>

            <p
                className="cursor-pointer flex items-center justify-center text-gray-600 mt-6 text-sm gap-1"
                onClick={() => router.push('/register')}
            >
                Want to create an account?
                <LogIn className="w-4 h-4" />
                <span className="text-green-600">Sign Up</span>
            </p>
        </div>
    )
}

export default LoginForm