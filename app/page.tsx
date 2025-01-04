// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Calendar,
  Shield,
  Activity,
  Heart,
  Mic,
  Brain,
  Bot,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const LogoText = () => (
  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
    Onset
  </span>
);

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      icon: <Mic className="h-6 w-6 text-primary" />,
      title: "AI Voice Assistant",
      description:
        "Intelligent voice agent for seamless appointment booking and management",
    },
    {
      icon: <Brain className="h-6 w-6 text-primary" />,
      title: "Smart Analytics",
      description:
        "AI-powered insights for better practice management and patient care",
    },
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "Automated Scheduling",
      description:
        "AI optimization for efficient appointment scheduling and resource allocation",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure Platform",
      description: "Enterprise-grade security with AI-enhanced protection",
    },
  ];

  const aiCapabilities = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Voice-Powered Booking",
      description:
        "Our AI voice agent handles appointment scheduling, making it effortless for both practitioners and patients",
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Real-time Dashboard Updates",
      description:
        "Instantly view and manage appointments scheduled through our voice assistant",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Future AI Innovations",
      description:
        "Coming soon: AI-driven patient insights, automated documentation, and predictive analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-300">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent" />
      </div>

      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-dark-200/80 backdrop-blur-sm border-b border-dark-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <LogoText />
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/80">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative pt-32 pb-20 px-4 overflow-hidden"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary"
              >
                <Bot className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  AI-Powered Healthcare Management
                </span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                The Future of
                <span className="block text-primary">Medical Practice</span>
                Is Here
              </h1>
              <p className="text-lg text-dark-600">
                Transform your healthcare practice with our AI-powered platform.
                From voice-assisted booking to intelligent analytics, we are
                bringing the future of healthcare management to you today.
              </p>
              <div className="flex gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/80">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Login to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative lg:block">
              <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                <Image
                  src="https://images.unsplash.com/photo-1587854680352-936b22b91030?auto=format&fit=crop&w=800&q=80"
                  alt="AI Healthcare Technology"
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI Features Section */}
      <section className="py-20 bg-dark-200 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
            >
              <Brain className="h-4 w-4 mr-2" />
              <span className="text-sm">AI-Powered Features</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience the Power of AI
            </h2>
            <p className="text-dark-600 max-w-2xl mx-auto">
              Our platform leverages cutting-edge artificial intelligence to
              streamline your practice management and enhance patient care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {aiCapabilities.map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-dark-300 border border-dark-100 hover:border-primary/50 transition-colors"
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  {capability.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {capability.title}
                </h3>
                <p className="text-dark-600">{capability.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-dark-300 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Why Choose Onset
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-dark-200 border border-dark-100 hover:border-primary/50 transition-colors"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-dark-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-200 border-t border-dark-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <LogoText />
            </div>
            <p className="text-dark-600 text-sm">
              © 2024 Onset. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
