"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { InfoIcon, ScanIcon, StoreIcon } from "./icons/svg";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { role } = useUser();
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (pathname == "/connect" || pathname.startsWith("/dashboard")) {
        return null;
    }
    const navItems = [
        ...(role === 'owner' ? [{
            name: "Dashboard", href: "/dashboard", icon:
                <StoreIcon className="w-5 h-5" />
        }] : []),
        {
            name: "Scan", href: "/scan", icon:
                <ScanIcon className="w-5 h-5" />
        },
        {
            name: "How to Use", href: "/how-to-use", icon:
                <InfoIcon className="w-5 h-5" />
        },
        {
            name: "About", href: "/about", icon:
                <InfoIcon className="w-5 h-5" />
        },
        {
            name: "Contact", href: "/contact", icon:
                <InfoIcon className="w-5 h-5" />
        },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-100 px-4 py-4 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center relative">
                <div className="hidden md:flex items-center pointer-events-auto">
                    <motion.div
                        ref={navRef}
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex items-center bg-white border border-gray-200 shadow-md shadow-black/25 rounded-full"
                    >
                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-black shrink-0"
                            animate={{ rotate: isOpen ? -360 : 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {isOpen ?
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 8L8 12M8 12L12 16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                : <Image
                                    className="rounded-full"
                                    src="/assets/tableOS-logo.svg"
                                    alt="TableOS"
                                    width={30}
                                    height={30}
                                />}
                        </motion.button>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0, x: -10 }}
                                    animate={{ width: "auto", opacity: 1, x: 0 }}
                                    exit={{ width: 0, opacity: 0, x: -10 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    className="overflow-hidden flex items-center whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-px">
                                        {navItems.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="relative px-4 py-2 group"
                                                >
                                                    <span
                                                        className={`relative z-10 text-sm font-bold transition-colors duration-300 ${isActive ? "text-black underline decoration-2 decoration-black underline-offset-2" : "text-gray-700/30 group-hover:text-black"
                                                            }`}
                                                    >
                                                        {item.name}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <MobileShutterMenu
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    navItems={navItems}
                />

                <div className="md:hidden flex justify-between items-center">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-12 h-12 pointer-events-auto bg-white border border-gray-200 shadow-md shadow-black/25 rounded-4xl flex items-center justify-center text-black"
                    >
                        <Image
                            className="rounded-full"
                            src="/assets/tableOS-logo.svg"
                            alt="TableOS"
                            width={30}
                            height={30}
                        />
                    </button>
                </div>
            </div>
        </nav>
    );
}

const MobileShutterMenu = ({ isOpen, setIsOpen, navItems }: { isOpen: boolean, setIsOpen: (value: boolean) => void, navItems: any[] }) => {
    const pathname = usePathname();
    const { role } = useUser();
    const x = useMotionValue(0);
    const swipeWidth = 280;
    const opacity = useTransform(x, [0, swipeWidth], [1, 0]);
    const router = useRouter();

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > swipeWidth / 2) {
            x.set(swipeWidth);
            setTimeout(() => {
                router.push("/connect");
                x.set(0);
                setIsOpen(false);
            }, 200);
        } else {
            x.set(0);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 md:hidden pointer-events-auto"
                    />
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        className="fixed top-0 left-0 right-0 bg-white rounded-b-3xl px-4 py-4 shadow-2xl z-101 md:hidden pointer-events-auto border-b border-gray-100"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="grid gap-2">
                                {navItems.map((item: any) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 px-5 py-4 rounded-xl active:text-black active:bg-gray-100 transition-all duration-200 group"
                                    >
                                        <span className="text-black group-active:text-black">{item.icon}</span>
                                        <span className="font-bold text-black sm:text-lg text-sm tracking-tight group-active:text-black">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                            {pathname !== "/connect" && role !== 'owner' && (
                                <div className="mt-6 relative w-full h-14 bg-black rounded-full px-2 flex items-center overflow-hidden">
                                    <motion.div
                                        style={{ opacity }}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                    >
                                        <span className="text-white font-bold text-center">
                                            Slide to Connect
                                        </span>
                                    </motion.div>

                                    <motion.div
                                        drag="x"
                                        dragConstraints={{ left: 0, right: swipeWidth }}
                                        dragElastic={0.1}
                                        onDragEnd={handleDragEnd}
                                        style={{ x }}
                                        className="relative z-10 w-10 h-10 bg-white rounded-[1.8rem] flex items-center justify-center cursor-grab active:cursor-grabbing"
                                    >
                                        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </div>
                            )}
                            <div className="flex justify-center">
                                <div className="w-10 h-1 rounded-full bg-gray-200" />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}