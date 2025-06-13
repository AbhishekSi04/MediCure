'use client'

import { checkUser } from "@/lib/checkUser";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ShieldCheck, Stethoscope, Calendar, User as UserIcon, CreditCard } from "lucide-react";
import { User } from "@/lib/generated/prisma";
import { checkAndAllocateCredits } from "@/actions/credits";
import { Badge } from "./ui/badge";

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
    <div className="flex justify-end items-center p-4 gap-4 h-16">
      {/* Action Buttons */}
      <SignedIn>
        {/* Admin Links */}
        {user?.role === "ADMIN" && (
          <Link href="/admin">
            <Button
              variant="outline"
              className="hidden md:inline-flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Dashboard
            </Button>
            <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
              <ShieldCheck className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Doctor Links */}
        {user?.role === "DOCTOR" && (
          <Link href="/doctor">
            <Button
              variant="outline"
              className="hidden md:inline-flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              Doctor Dashboard
            </Button>
            <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
              <Stethoscope className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Patient Links */}
        {user?.role === "PATIENT" && (
          <Link href="/appointments">
            <Button
              variant="outline"
              className="hidden md:inline-flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              My Appointments
            </Button>
            <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
              <Calendar className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Unassigned Role */}
        {user?.role === "UNASSIGNED" && (
          <Link href="/onboarding">
            <Button
              variant="outline"
              className="hidden md:inline-flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4" />
              Complete Profile
            </Button>
            <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
              <UserIcon className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </SignedIn>

      {(!user || user?.role !== "ADMIN") && (
            <Link href={user?.role === "PATIENT" ? "/pricing" : "/doctor"}>
              <Badge
                variant="outline"
                className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
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
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
}
