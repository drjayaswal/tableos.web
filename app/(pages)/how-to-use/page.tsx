"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHatIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import { useRouter } from "next/navigation";

const ownerSteps = [
    {
        id: 1,
        label: "01",
        title: "Register Your Business",
        desc: "Configure your unit as a Cafe, Hotel, or Restaurant. Set local currency and geolocation for customer discovery.",
        image: "/app/tableos-1.png",
    },
    {
        id: 2,
        label: "02",
        title: "Define Your Spaces",
        desc: "Add physical tables to your digital dashboard. Each table receives unique metadata to isolate dining sessions.",
        image: "/app/tableos-3.png",
    },
    {
        id: 3,
        label: "03",
        title: "Build Your Menu Catalog",
        desc: "Organize offerings into filtered categories like Starters or Mains. Structure increases upsell potential significantly.",
        image: "/app/tableos-5.png",
    },
    {
        id: 4,
        label: "04",
        title: "Set Item Attributes",
        desc: "Define Preparation Times and Dietary Labels. Accurate metadata builds customer trust and reduces staff inquiry time.",
        image: "/app/tableos-7.png",
    },
    {
        id: 5,
        label: "05",
        title: "Go Live",
        desc: "Toggle items online or offline in real-time. The customer menu updates in milliseconds without a page refresh.",
        image: "/app/tableos-9.png",
    },
];

const customerSteps = [
    {
        id: 1,
        label: "01",
        title: "Scan the Table QR",
        desc: "No app download required. Instantly initiate a session through your native mobile browser by scanning the table QR code.",
        image: "/app/tableos-12.png",
    },
    {
        id: 2,
        label: "02",
        title: "Browse the Menu",
        desc: "Explore high-fidelity imagery with dietary filters for a fully informed ordering experience.",
        image: "/app/tableos-14.png",
    },
    {
        id: 3,
        label: "03",
        title: "Add to Cart",
        desc: "Select items, customize preferences, and build your order at your own pace before submitting.",
        image: "/app/tableos-16.png",
    },
    {
        id: 4,
        label: "04",
        title: "Track Your Order",
        desc: "Receive real-time push notifications as your order moves from Preparing to Ready status.",
        image: "/app/tableos-18.png",
    },
    {
        id: 5,
        label: "05",
        title: "Frictionless Checkout",
        desc: "Track your bill in real-time and complete digital payment verification for a seamless exit.",
        image: "/app/tableos-20.png",
    },
];

type TimelineStep = {
    id: number;
    label: string;
    title: string;
    desc: string;
    image: string;
};

const TimelineSection = ({
    steps,
    sectionTitle,
    sectionSubtitle,
}: {
    steps: TimelineStep[];
    sectionTitle: string;
    sectionSubtitle: string;
}) => {
    const [active, setActive] = useState(0);
    return (
        <section className="py-8 md:py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-12 md:mb-16">
                    <p className="text-xs font-mono tracking-[0.3em] text-gray-400 uppercase mb-3">{sectionSubtitle}</p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">{sectionTitle}</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                    <div className="w-full lg:w-2/5 flex flex-col gap-0">
                        {steps.map((step, i) => (
                            <button
                                key={step.id}
                                onClick={() => setActive(i)}
                                className="text-left group relative cursor-pointer focus:outline-none"
                            >
                                <div className="flex gap-5 items-stretch py-4 md:py-">
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 border-2 transition-colors duration-300 z-10"
                                            animate={{
                                                backgroundColor: active === i ? "#10b922" : "white",
                                                borderColor: active === i ? "#10b922" : "white",
                                                color: active === i ? "white" : "black",
                                            }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            {step.label}
                                        </motion.div>
                                        {i < steps.length - 1 && (
                                            <div className="w-0.5 flex-1 mt-3 bg-gray-200 relative overflow-hidden">
                                                <motion.div
                                                    className="absolute top-0 left-0 w-full bg-gray-200"
                                                    animate={{ height: active >= i ? "100%" : "0%" }}
                                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pb-4 flex-1 min-w-0">
                                        <motion.p
                                            className="font-bold text-base md:text-lg mb-1 transition-colors duration-200"
                                            animate={{ color: active === i ? "#000" : "#94a3b8" }}
                                        >
                                            {step.title}
                                        </motion.p>
                                        <AnimatePresence>
                                            {active === i && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-gray-500 text-sm font-semibold leading-relaxed overflow-hidden"
                                                >
                                                    {step.desc}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="w-full lg:w-3/5 lg:sticky lg:top-24">
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200/60 bg-gray-100 shadow-inner aspect-video">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active}
                                    initial={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={steps[active].image}
                                        alt={steps[active].title}
                                        fill
                                        quality={80}
                                        className="object-cover"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute inset-0 flex items-end p-5 pointer-events-none">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3"
                                    >
                                        <p className="font-mono text-xs text-gray-400 mb-0.5">{steps[active].label}</p>
                                        <p className="font-bold text-sm text-black">{steps[active].title}</p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="absolute bottom-5 right-5 flex gap-1.5">
                                {steps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActive(i)}
                                        className="focus:outline-none"
                                    >
                                        <motion.div
                                            className="h-1.5 rounded-full bg-black"
                                            animate={{ width: active === i ? 24 : 6, opacity: active === i ? 1 : 0.2 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HowToUsePage = () => {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <header className="bg-gray-50/50 shadow-inner shadow-black/30 py-30 px-6 relative overflow-hidden">
                <div className="absolute top-20 right-20 p-20 grayscale opacity-5 pointer-events-none">
                    <Image src="/assets/tableOS-logo.svg" className='scale-400' alt="TableOS Logo" width={150} height={150} />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter text-black mb-6"
                    >
                        How to Use <span className="text-main">tableOS</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        A systematic workflow for cafes, hotels and restaurants to digitize their floor operations and menu management.
                    </motion.p>
                </div>
            </header>

            <main className="space-y-0">
                <div className="border-b border-gray-100">
                    <TimelineSection
                        steps={ownerSteps}
                        sectionTitle="For Store Owners"
                        sectionSubtitle="Onboarding & Management"
                    />
                </div>

                <TimelineSection
                    steps={customerSteps}
                    sectionTitle="For Customers"
                    sectionSubtitle="Dining Experience"
                />

                <section className="bg-main rounded-[80px] mx-6 mb-16 p-10 md:p-10 md:px-15 text-black overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center">User Journey</h2>
                        <div className="grid md:grid-cols-3 bg-black py-px">
                            <div className="space-y-6 text-center md:text-left ml-px p-5 bg-white">
                                <div className="w-12 h-12 flex items-center justify-center mx-auto md:mx-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.5 6.5H6.51M17.5 6.5H17.51M6.5 17.5H6.51M13 13H13.01M17.5 17.5H17.51M17 21H21V17M14 16.5V21M21 14H16.5M15.6 10H19.4C19.9601 10 20.2401 10 20.454 9.89101C20.6422 9.79513 20.7951 9.64215 20.891 9.45399C21 9.24008 21 8.96005 21 8.4V4.6C21 4.03995 21 3.75992 20.891 3.54601C20.7951 3.35785 20.6422 3.20487 20.454 3.10899C20.2401 3 19.9601 3 19.4 3H15.6C15.0399 3 14.7599 3 14.546 3.10899C14.3578 3.20487 14.2049 3.35785 14.109 3.54601C14 3.75992 14 4.03995 14 4.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10ZM4.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V4.6C10 4.03995 10 3.75992 9.89101 3.54601C9.79513 3.35785 9.64215 3.20487 9.45399 3.10899C9.24008 3 8.96005 3 8.4 3H4.6C4.03995 3 3.75992 3 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3 3.75992 3 4.03995 3 4.6V8.4C3 8.96005 3 9.24008 3.10899 9.45399C3.20487 9.64215 3.35785 9.79513 3.54601 9.89101C3.75992 10 4.03995 10 4.6 10ZM4.6 21H8.4C8.96005 21 9.24008 21 9.45399 20.891C9.64215 20.7951 9.79513 20.6422 9.89101 20.454C10 20.2401 10 19.9601 10 19.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14H4.6C4.03995 14 3.75992 14 3.54601 14.109C3.35785 14.2049 3.20487 14.3578 3.10899 14.546C3 14.7599 3 15.0399 3 15.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Scan</h3>
                                <p className="text-black text-sm leading-relaxed font-medium">No applications required. Instant session initiation via native mobile browsers.</p>
                            </div>
                            <div className="space-y-6 text-center md:text-left mx-px p-5 bg-white">
                                <div className="w-12 h-12 flex items-center justify-center mx-auto md:mx-0">
                                    <ChefHatIcon size={24} weight="fill" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Select</h3>
                                <p className="text-black text-sm leading-relaxed font-medium">High-fidelity imagery and dietary filters for an informed ordering experience.</p>
                            </div>
                            <div className="space-y-6 text-center md:text-left mr-px p-5 bg-white">
                                <div className="w-12 h-12 flex items-center justify-center mx-auto md:mx-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Settle</h3>
                                <p className="text-black text-sm leading-relaxed font-medium">Real-time bill tracking and digital payment verification for frictionless checkout.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 px-6 mb-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight mb-4 text-black">Operations Protocol</h2>
                            <p className="text-gray-500 font-medium">How your staff interacts with the system</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "Order Monitoring", desc: "Live kitchen display updates instantly upon table order submission." },
                                { title: "Production Flow", desc: "Update states (Preparing → Ready) to push notifications to customer devices." },
                                { title: "Session Termination", desc: "Marking as 'Paid' archives the session and clears the table status for new guests." }
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] group">
                                    <div className="flex gap-6 items-center">
                                        <div className="text-white font-mono bg-main p-2 px-2.5 rounded-full">
                                            0{index + 1}
                                        </div>
                                        <span className="font-bold text-xl text-gray-800">{item.title}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm md:text-right mt-4 md:mt-0 font-medium max-w-xl leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-50/50 p-6 py-8 text-center shadow-inner relative overflow-hidden">
                <div className="relative z-10">
                    <Image
                        src="/assets/tableOS-logo.svg"
                        className="hidden lg:block absolute scale-[3.5] top-0 left-0 opacity-5"
                        alt="TableOS Logo"
                        width={150}
                        height={150}
                    />
                    <h2 className="text-2xl md:text-4xl font-bold text-black mb-8 tracking-tighter">Ready to optimize your floor?</h2>
                    <button onClick={() =>
                        router.push("/dashboard")} className="hover:border-gray-200/50 border-transparent border hover:bg-white text-black cursor-pointer transition-all duration-300 px-6 py-3 rounded-[22px] font-bold text-lg hover:shadow-md hover:shadow-black/20 inline-flex items-center gap-3">
                        Enter Dashboard
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default HowToUsePage;