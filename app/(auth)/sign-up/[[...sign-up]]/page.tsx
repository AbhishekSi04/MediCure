'use client'

import {SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold"></h1>
      <SignUp />
    </div>
  )
}
