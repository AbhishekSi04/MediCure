'use client'

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold"></h1>
      <SignIn />
    </div>
  )
}
