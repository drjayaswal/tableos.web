"use client";

import {
    TargetIcon,
    EyeIcon,
} from "@phosphor-icons/react";
import Image from "next/image";

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-black">
           <header className="bg-gray-50/50 shadow-inner shadow-black/30 py-30 px-6 relative overflow-hidden">
                <div className="absolute top-20 right-20 p-20 grayscale opacity-5 pointer-events-none">
                    <Image src="/assets/tableOS-logo.svg" className='scale-400' alt="TableOS Logo" width={150} height={150} priority/>

                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black mb-6">
                        Architecting <span className="text-main">Hospitality</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        We are a team of engineers and industry experts dedicated to eliminating friction in the dining experience through intelligent automation.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-20 px-6">
                <div className="grid grid-cols-1 gap-12 lg:gap-24 items-start">
                    <div className="space-y-16">
                        <section className="space-y-6">
                            <div className="inline-flex items-center gap-3 text-main">
                                <TargetIcon size={32} weight="fill" />
                                <h2 className="text-3xl font-bold tracking-tight">The Mission</h2>
                            </div>
                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                To empower HORECA units with a digital backbone that simplifies complex operations into a single, intuitive scan-to-order workflow.
                            </p>
                            <div className="h-1 w-full bg-main rounded-full" />
                        </section>

                        <section className="space-y-6">
                            <div className="inline-flex items-center gap-3 text-black">
                                <EyeIcon size={32} weight="fill" />
                                <h2 className="text-3xl font-bold tracking-tight">The Vision</h2>
                            </div>
                            <p className="text-slate-500 leading-relaxed">
                                We envision a world where waiting for a menu or a bill is a thing of the past. By merging geofencing technology with real-time state management, we're building the infrastructure for the next generation of smart restaurants.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <footer className="bg-gray-50/50 p-6 py-8 text-center shadow-inner relative overflow-hidden">
                <div className="relative z-10">
                    <Image
                        src="/assets/tableOS-logo.svg"
                        className="hidden lg:block absolute scale-[3.5] top-0 left-0 opacity-5"
                        alt="TableOS Logo"
                        width={150}
                        height={150}
                        priority
                    />
                    <h2 className="text-2xl md:text-4xl font-bold text-black mb-8 tracking-tighter">Ready to optimize your floor?</h2>
                    <button className="hover:border-gray-200/50 border-transparent border hover:bg-white text-black cursor-pointer transition-all duration-300 px-6 py-3 rounded-[22px] font-bold text-lg hover:shadow-md hover:shadow-black/20 inline-flex items-center gap-3">
                        Built by enthusiasts
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;