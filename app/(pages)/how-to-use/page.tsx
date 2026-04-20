"use client"

import {
    ArrowRightIcon,
    QrCodeIcon,
    ChefHatIcon,
    UsersIcon,
    ImageBrokenIcon,
    StorefrontIcon
} from '@phosphor-icons/react';
import Image from 'next/image';

const HowToUsePage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <header className="bg-gray-200/50 shadow-inner py-30 px-6 relative overflow-hidden">
                <div className="absolute top-20 right-20 p-20 grayscale opacity-5 pointer-events-none">
                    <Image src="/tableOS-logo.svg" className='scale-400 invert' alt="TableOS Logo" width={150} height={150} />

                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black mb-6">
                        How To Use <span className="text-main">tableOS</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        A systematic workflow for cafes, hotels and restaurants to digitize their floor operations and menu management.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-24 px-6 space-y-32">
                <section className="grid lg:grid-cols-2 gap-16 items-start">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-4">
                            <div className="w-14 h-14 rounded-3xl bg-main flex items-center justify-center text-white shadow-xl shadow-main/20">
                                <StorefrontIcon size={28} weight="fill" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Onboarding <br />Your Store</h2>
                        </div>

                        <div className="space-y-10">
                            <div className="group">
                                <p className="text-xl font-bold mb-2">Business Configuration</p>
                                <p className="text-slate-500 leading-relaxed">Register your unit as a <strong>Cafe, Hotel, or Restaurant</strong>. Standardize your local currency and geolocation for customer discovery.</p>
                            </div>
                            <div className="group">
                                <p className="text-xl font-bold mb-2">Define Your Spaces</p>
                                <p className="text-slate-500 leading-relaxed">Add physical tables to your digital dashboard. The system generates unique metadata for every table to isolate dining sessions.</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[3rem] p-12 border-4 border-dotted border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
                        <ImageBrokenIcon size={100} weight="thin" className="text-gray-200" />
                        <div className="text-center">
                            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Dashboard Asset</p>
                        </div>
                    </div>
                </section>

                <section className="grid lg:grid-cols-2 gap-16 items-start">
                    <div className="lg:order-2 space-y-8">
                        <div className="inline-flex items-center gap-4">
                            <div className="w-14 h-14 rounded-3xl bg-black flex items-center justify-center text-white shadow-xl shadow-black/10">
                                <ChefHatIcon size={28} weight="fill" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Digital <br />Catalog</h2>
                        </div>

                        <div className="space-y-10">
                            <div className="group">
                                <p className="text-xl font-bold mb-2">Menu Categories</p>
                                <p className="text-slate-500 leading-relaxed">Organize offerings into filtered groups like Starters or Mains. A logical structure significantly increases upsell potential.</p>
                            </div>
                            <div className="group">
                                <p className="text-xl font-bold mb-2">Item Attributes</p>
                                <p className="text-slate-500 leading-relaxed">Define <strong>Preparation Times</strong> and <strong>Dietary Labels</strong>. Accurate metadata builds customer trust and reduces staff inquiry time.</p>
                            </div>
                            <div className="group">
                                <p className="text-xl font-bold mb-2">Real-Time Availability</p>
                                <p className="text-slate-500 leading-relaxed">Toggle items "Offline" instantly when stock runs out. The customer menu updates in milliseconds without a page refresh.</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[3rem] p-12 border-4 border-dotted border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
                        <ImageBrokenIcon size={100} weight="thin" className="text-gray-200" />
                        <div className="text-center">
                            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Menu Asset</p>
                        </div>
                    </div>
                </section>

                <section className="bg-main rounded-[80px] p-10 md:p-10 md:px-15 text-white overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center">User Journey</h2>
                        <div className="grid md:grid-cols-3 gap-16">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                                    <QrCodeIcon size={24} weight="fill" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Scan</h3>
                                <p className="text-white/80 text-sm leading-relaxed font-medium">No applications required. Instant session initiation via native mobile browsers.</p>
                            </div>
                            <div className="space-y-6 text-center md:text-left">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                                    <ChefHatIcon size={24} weight="fill" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Select</h3>
                                <p className="text-white/80 text-sm leading-relaxed font-medium">High-fidelity imagery and dietary filters for an informed ordering experience.</p>
                            </div>
                            <div className="space-y-6 text-center md:text-left">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                                    <UsersIcon size={24} weight="fill" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">Settle</h3>
                                <p className="text-white/80 text-sm leading-relaxed font-medium">Real-time bill tracking and digital payment verification for frictionless checkout.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight mb-4 text-black">Operations Protocol</h2>
                            <p className="text-slate-500 font-medium">How your staff interacts with the system</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "Order Monitoring", desc: "Live kitchen display updates instantly upon table order submission." },
                                { title: "Production Flow", desc: "Update states (Preparing → Ready) to push push notifications to customer devices." },
                                { title: "Session Termination", desc: "Marking as 'Paid' archives the session and clears the table status for new guests." }
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem]  group">
                                    <div className="flex gap-6 items-center">
                                        <div className="text-white font-mono bg-main p-2 px-2.5 rounded-full">
                                            0{index+1}
                                        </div>
                                        <span className="font-bold text-xl text-slate-800">{item.title}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm md:text-right mt-4 md:mt-0 font-medium max-w-xl leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-main p-6 py-8 text-center shadow-inner relative overflow-hidden">
                <div className="relative z-10">
                    <Image
                        src="/tableOS-logo.svg"
                        className="hidden lg:block absolute scale-[3.5] top-0 left-0"
                        alt="TableOS Logo"
                        width={150}
                        height={150}
                    />
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 tracking-tighter">Ready to optimize your floor?</h2>
                    <button className="bg-black hover:bg-white text-white hover:text-main cursor-pointer transition-all duration-300 px-6 py-3 rounded-[22px] font-bold text-lg shadow-2xl shadow-main/20 inline-flex items-center gap-3">
                        Enter Dashboard
                        <ArrowRightIcon weight="bold" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default HowToUsePage;