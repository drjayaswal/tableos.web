"use client";

import { Button } from "@/app/components/ui/button";
import {
    ArrowRightIcon,
    EnvelopeSimpleIcon,
    MapPinIcon,
    PhoneIcon,
} from "@phosphor-icons/react";
import Image from "next/image";

const ContactMethod = ({ icon: Icon, title, detail, href }: { icon: any, title: string, detail: string, href: string }) => (
    <a
        href={href}
        target="_blank"
        className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-4xl sm:rounded-[2.5rem] bg-gray-50 shadow-inner group transition-all"
    >
        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center text-main group-hover:scale-110 transition-transform duration-500">
            <Icon size={22} weight="fill" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-black mb-0.5">{title}</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate sm:whitespace-normal">{detail}</p>
        </div>
    </a>
);

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <header className="bg-gray-200/50 shadow-inner py-20 md:py-30 px-6 relative overflow-hidden">
                <div className="absolute top-20 right-20 p-20 grayscale opacity-5 pointer-events-none">
                    <Image src="/assets/tableOS-logo.svg" className='scale-400' alt="TableOS Logo" width={150} height={150} />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-black mb-6">
                        Get in <span className="text-main">Touch</span>
                    </h1>
                    <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Have questions about integrating TableOS? Our team is ready to help you optimize your restaurant floor.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-12 md:py-20 px-6">
                <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-start">
                    <div className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-8">Contact Channels</h2>
                        <div className="grid gap-4">
                            <ContactMethod
                                icon={EnvelopeSimpleIcon}
                                title="Email Us"
                                detail="mrdhruv.professional@gmail.com"
                                href="mailto:mrdhruv.professional@gmail.com"
                            />
                            <ContactMethod
                                icon={PhoneIcon}
                                title="Call Support"
                                detail="+91 6377257649"
                                href="tel:+916377257649"
                            />
                            <ContactMethod
                                icon={MapPinIcon}
                                title="Office"
                                detail="Jaipur, Rajasthan, India"
                                href="https://www.google.com/maps/place/Jaipur"
                            />
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 bg-gray-100 shadow-inner rounded-2xl md:p-12">
                        <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 tracking-tight">Send a Message</h3>
                        <form className="space-y-4 md:space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 space-y-1 md:space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-black">Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full px-3 md:px-6 py-2 outline-none text-sm font-medium transition-all" />
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 space-y-1 md:space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-black">Email</label>
                                    <input type="email" placeholder="john@example.com" className="w-full px-3 md:px-6 py-2 outline-none text-sm font-medium transition-all" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 space-y-1 md:space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-black">Subject</label>
                                <input type="text" placeholder="General Inquiry" className="w-full px-3 md:px-6 py-2 outline-none text-sm font-medium transition-all" />
                            </div>
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 space-y-1 md:space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-black">Message</label>
                                <textarea rows={4} placeholder="How can we help?" className="w-full px-3 md:px-6 py-2 outline-none text-sm font-medium transition-all resize-none" />
                            </div>
                            <Button variant="tableos">
                                Submit Your Message
                                <ArrowRightIcon size={18} weight="regular" />
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;