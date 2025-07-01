'use client'

import { checkUser } from "@/lib/checkUser";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ShieldCheck, Stethoscope, Calendar, User as UserIcon, CreditCard, MessageCircle } from "lucide-react";
import { User } from "@/lib/generated/prisma";
import { checkAndAllocateCredits } from "@/actions/credits";
import { Badge } from "./ui/badge";
import Logo from '@/assets/Logo.png'
import { ThemeToggle, ThemeToggleMobile } from "./theme-toggle";

type UserResponse = User | { error: string };

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  // if(user?.role=='PATIENT'){
  //   checkAndAllocateCredits(user);
  // }
  
  useEffect(() => {
    const fetchUser = async () => {
      const response = await checkUser();
      if (!('error' in response)) {
        setUser(response);
      }
      console.log(response);
    }
    fetchUser();
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto flex justify-between items-center py-4 h-16">
      <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 pt-1">
            <img className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center"
                            src={Logo.src}
                            alt="Doctor with Laptop"
                            // className="w-full h-full object-cover"
                    />
            <span className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-500">MediCure</span>
          </Link>
      </div>
      <div className="flex justify-end items-center px-3 gap-2 md:px-0 md:gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />
        <ThemeToggleMobile />

        {/* Action Buttons */}
        <SignedIn>

          {/* Admin Links */}
          {user?.role === "ADMIN" && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex items-center gap-2"
              >
                <ShieldCheck className="h-5 w-5" />
                Admin Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden w-8 h-8 p-0">
                <ShieldCheck className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Doctor Links */}
          {user?.role === "DOCTOR" && (
            <Link href="/doctor">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex items-center gap-2"
              >
                <Stethoscope className="h-4 w-4" />
                Doctor Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden w-8 h-8 p-0">
                <Stethoscope className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Patient Links */}
          {user?.role === "PATIENT" && (
            <Link href="/appointments">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                My Appointments
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden w-8 h-8 p-0">
                <Calendar className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Unassigned Role */}
          {user?.role === "UNASSIGNED" && (
            <Link href="/onboarding">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex items-center gap-2 text-white bg-blue-500 dark:bg-blue-500 hover:dark:bg-blue-600"
              >
                <UserIcon className="h-4 w-4" />
                Register
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden w-8 h-8 p-0">
                <UserIcon className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </SignedIn>

        {(!user || user?.role !== "ADMIN") && (
              <Link href={user?.role === "PATIENT" ? "/pricing" : "/doctor"}>
                <Badge
                  variant="outline"
                  className="h-7 md:h-9 bg-emerald-900/20 border-emerald-700/30 px-2 md:px-3 py-1 flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <CreditCard className="h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">
                    {user && user.role !== "ADMIN" ? (
                      <>
                        {user.credits}{" "}
                        <span className="hidden md:inline">
                          {user?.role === "PATIENT"
                            ? "Credits"
                            : "Earned Credits"}
                        </span>
                      </>
                    ) : (
                      <>Pricing</>
                    )}
                  </span>
                </Badge>
              </Link>
            )}

        <SignedOut>
          <div className="bg-blue-600 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-2 md:px-5 py-1 text-sm md:text-base font-semibold w-full sm:w-auto border rounded-md">
            <SignInButton />
          </div>
          {/* <SignUpButton /> */}
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}
