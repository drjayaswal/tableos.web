"use client";

import {
    UsersThreeIcon,
    TargetIcon,
    EyeIcon,
    ArrowUpRightIcon,
} from "@phosphor-icons/react";
import Image from "next/image";

const AboutPage = () => {
    return (

        <div className="min-h-screen bg-white font-sans text-black">
            <header className="bg-gray-200/50 shadow-inner py-25 px-6 relative overflow-hidden">
                <div className="absolute top-20 right-20 p-20 grayscale opacity-5 pointer-events-none">
                    <Image
                        src="/tableOS-logo.svg"
                        className="scale-400 invert"
                        alt="TableOS Logo"
                        width={150}
                        height={150}
                    />
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
            <footer className="bg-main p-6 py-12 text-center shadow-inner relative overflow-hidden">
                <div className="relative z-10">
                    <Image
                        src="/tableOS-logo.svg"
                        className="hidden lg:block absolute scale-[3.5] top-0 left-0"
                        alt="TableOS Logo"
                        width={150}
                        height={150}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                        <UsersThreeIcon size={40} weight="duotone" className="text-white" />
                        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tighter">
                            Built by enthusiasts
                        </h2>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;