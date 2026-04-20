"use client";

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
        className="flex items-center gap-5 p-6 rounded-[2.5rem] bg-gray-50 shadow-inner"
    >
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-main group-hover:scale-110 transition-transform duration-500">
            <Icon size={24} weight="fill" />
        </div>
        <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black mb-0.5">{title}</p>
            <p className="text-lg font-bold text-slate-900 tracking-tight">{detail}</p>
        </div>
    </a>
);

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <header className="bg-gray-200/50 shadow-inner py-30 px-6 relative overflow-hidden">
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
                        Get in <span className="text-main">Touch</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Have questions about integrating TableOS? Our team is ready to help you optimize your restaurant floor.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-20 px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight mb-8">Contact Channels</h2>
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
                    <div className="p-8 md:p-12">
                        <h3 className="text-2xl font-bold mb-8 tracking-tight">Send a Message</h3>
                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-black pl-4">Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full  rounded-3xl px-6 py-4 outline-none text-sm font-medium transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-black pl-4">Email</label>
                                    <input type="email" placeholder="john@example.com" className="w-full  rounded-3xl px-6 py-4 outline-none text-sm font-medium transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-black pl-4">Subject</label>
                                <input type="text" placeholder="General Inquiry" className="w-full  rounded-3xl px-6 py-4 outline-none text-sm font-medium transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-black pl-4">Message</label>
                                <textarea rows={4} placeholder="How can we help?" className="w-full  rounded-4xl px-6 py-4 outline-none text-sm font-medium transition-all resize-none" />
                            </div>
                            <button className="w-full flex cursor-pointer items-center gap-2 bg-main justify-center hover:bg-black text-white px-5 py-3 rounded-3xl font-bold text-md mt-4 active:scale-[0.97]">
                                Submit Your Message
                                <ArrowRightIcon size={20} weight="regular" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;