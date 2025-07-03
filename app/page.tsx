'use client'

import { PricingTable, SignedIn, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { checkAndAllocateCredits } from "@/actions/credits";
import { checkUser } from "@/lib/checkUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Stethoscope, 
  Clock, 
  Shield, 
  Users, 
  Star, 
  ArrowRight,
  CheckCircle,
  Video,
  MessageCircle,
  Calendar,
  Zap,
  Play
} from "lucide-react";
import Header from "@/components/header";
import HeroImage from '@/assets/Hero Image.webp'
import Logo from "@/assets/Logo.png"
import ChatbotModal from "@/components/chatbot-modal";
import Link from "next/link";

export default function Home() {
  const { user: clerkUser } = useUser();
  const lastPlanRef = useRef<string | null>(null);
  const isFirstLoad = useRef(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    const handleSubscriptionChange = async () => {
      if (clerkUser) {
        // Get current subscription plan from Clerk
        const subscription = clerkUser.publicMetadata.subscription as string | undefined;
        const currentPlan = subscription || "free_user";

        // Skip the first load check
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          lastPlanRef.current = currentPlan;
          return;
        }

        // Only proceed if the plan has changed
        if (currentPlan !== lastPlanRef.current) {
          console.log("Subscription plan changed from", lastPlanRef.current, "to", currentPlan);
          lastPlanRef.current = currentPlan;
          
          const dbUser = await checkUser();
          if (!('error' in dbUser) && (dbUser as any).role === 'PATIENT') {
            await checkAndAllocateCredits(dbUser);
          }
        }
      }
    };

    // Set up an interval to check for subscription changes
    const interval = setInterval(handleSubscriptionChange, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [clerkUser]);

  const features = [
    {
      icon: Video,
      title: "Video Consultations",
      description: "Connect with doctors face-to-face from anywhere, anytime"
    },
    {
      icon: MessageCircle,
      title: "Secure Messaging",
      description: "Chat with your healthcare providers securely and privately"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book appointments with just a few clicks"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your health information is protected and secure"
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Get healthcare support whenever you need it"
    },
    {
      icon: Users,
      title: "Expert Doctors",
      description: "Board-certified physicians and specialists"
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Patients" },
    { number: "500+", label: "Expert Doctors" },
    { number: "50K+", label: "Consultations" },
    { number: "99%", label: "Satisfaction Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content: "MediCure has completely transformed how I access healthcare. The video consultations are so convenient, and the doctors are incredibly knowledgeable. I can get expert medical advice without leaving my home!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      role: "Cardiologist",
      content: "As a doctor, I love how MediCare streamlines patient care. The platform is intuitive, and I can provide quality care to more patients efficiently. The secure messaging feature is particularly useful for follow-ups.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Patient",
      content: "The scheduling system is amazing - I can book appointments in seconds and get reminders. The doctors are professional and caring. MediCare has made healthcare accessible and stress-free for my family.",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen ">
      
      {/* Chatbot Floating Button (fixed bottom right) */}
      <SignedIn>
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Open Health Assistant Chatbot"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden md:inline font-semibold">Health Assistant</span>
        </button>
      </SignedIn>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-6 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-4 sm:mb-6 lg:mb-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/30 dark:hover:bg-blue-900/30 text-sm">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Your Health, Our Priority
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 lg:mb-8 leading-tight">
                Healthcare Made
                <br />
                <span className="text-blue-600 dark:text-blue-400">Simple</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 lg:mb-12 leading-relaxed px-4 sm:px-0">
              Talk to certified doctors anytime, anywhere.
              Get expert advice, prescriptions, and care—right from home.
              </p>
              <div className="flex flex-row gap-4 sm:gap-6 justify-center md:justify-start ">
                <Link href='/onboarding'>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link href='/contact'>
                  <Button size="lg" className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="hidden md:mt-10 md:flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">Dr</span>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/50 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-xs font-semibold">Dr</span>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs font-semibold">Dr</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">500+ Expert Doctors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative order-second lg:order-last">
              <div className="relative z-10">
                {/* Main doctor image */}
                <div className="relative">
                    <img
                            src={HeroImage.src}
                            alt="Doctor with Laptop"
                            className="w-full h-auto max-h-80 sm:max-h-96 lg:max-h-none object-cover rounded-lg lg:rounded-none"
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-200 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose MediCare?
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              We're revolutionizing healthcare delivery with technology that puts you first
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 dark:text-slate-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300">
              Get the care you need in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Book Appointment</h3>
              <p className="text-gray-600 dark:text-slate-300">Choose your doctor and schedule a consultation at your convenience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Connect & Consult</h3>
              <p className="text-gray-600 dark:text-slate-300">Join your video call and get expert medical advice</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Get Care</h3>
              <p className="text-gray-600 dark:text-slate-300">Receive prescriptions, referrals, and follow-up care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300">
              Real stories from patients and doctors who trust MediCure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-200 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-4">
                      <span className="text-gray-800 dark:text-white font-semibold text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300">
              Flexible pricing options to meet your healthcare needs
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 dark:border dark:border-slate-700">
            <PricingTable />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={Logo.src} alt="MediCure Logo" className="w-8 h-8" />
                <span className="text-xl font-bold">MediCure</span>
              </div>
              <p className="text-slate-300 text-sm">
                Revolutionizing healthcare delivery with technology that puts patients first.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Find Doctors</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Emergency Care</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Health Records</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Telemedicine</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Mental Health</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Prescriptions</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Lab Tests</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Live Chat</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm">
                © 2024 MediCare. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">HIPAA Notice</a>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Modal */}
      <ChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />

    </div>
  );
}
