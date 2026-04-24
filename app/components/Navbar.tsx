"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { HomeIcon, InfoIcon, ScanIcon, StoreIcon } from "./icons/svg";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { role } = useUser();
    const navRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [mobileOpen]);

    if (pathname === "/connect" || pathname.startsWith("/dashboard")) {
        return null;
    }

    const navItems = [
        ...(role === 'owner' ? [{
            name: "Dashboard", href: "/dashboard", icon: <StoreIcon className="w-5 h-5" />
        }] : []),
        { name: "Home", href: "/", icon: <HomeIcon className="w-5 h-5" /> },
        { name: "Scan", href: "/scan", icon: <ScanIcon className="w-5 h-5" /> },
        { name: "How to Use", href: "/how-to-use", icon: <InfoIcon className="w-5 h-5" /> },
        { name: "About", href: "/about", icon: <InfoIcon className="w-5 h-5" /> },
        { name: "Contact", href: "/contact", icon: <InfoIcon className="w-5 h-5" /> },
    ];

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <>
            <header
                className="fixed w-full top-0 z-50 hidden md:block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="bg-white border-b border-gray-200 shadow-md">
                    <div className="mx-auto flex h-8 max-w-[1200px] items-center justify-center px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 bg-transparent cursor-default select-none">
                            <span className="text-[17px] tracking-tight font-bold">tableOS</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            className="absolute top-10 left-0 right-0 flex justify-center pb-2"
                        >
                            <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-lg shadow-black/10 rounded-xl px-2 py-1.5">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
                                                ${isActive
                                                    ? "text-black underline underline-offset-4"
                                                    : "text-gray-400 hover:text-black hover:bg-gray-200/75"
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

               <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 md:hidden">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl px-3 py-2">
                        <Image src="/assets/tableOS-logo.svg" alt="tableOS" width={22} height={22} priority />
                        <span className="text-sm font-semibold tracking-tight">tableOS</span>
                    </Link>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="w-11 h-11 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl flex items-center justify-center cursor-pointer"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <MobileShutterMenu isOpen={mobileOpen} setIsOpen={setMobileOpen} navItems={navItems} />
            </nav>
        </>
    );
}

const MobileShutterMenu = ({ isOpen, setIsOpen, navItems }: { isOpen: boolean; setIsOpen: (v: boolean) => void; navItems: any[] }) => {
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 pointer-events-auto"
                    />
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", stiffness: 380, damping: 38 }}
                        className="fixed top-0 left-0 right-0 bg-white z-50 pointer-events-auto rounded-b-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="px-5 pt-5 pb-2 flex items-center justify-between border-b border-gray-100">
                            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                                <Image src="/assets/tableOS-logo.svg" alt="tableOS" width={22} height={22} priority />
                                <span className="text-[16px] font-semibold tracking-tight">tableOS</span>
                            </Link>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-4 py-3">
                            {navItems.map((item: any, i: number) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 35 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
                                    >
                                        <span className="text-gray-400 group-hover:text-black transition-colors">{item.icon}</span>
                                        <span className="font-semibold text-gray-800 text-[15px] tracking-tight group-hover:text-black transition-colors">{item.name}</span>
                                        <svg className="ml-auto w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="px-5 pb-3 pt-5 border-t border-gray-100">
                            {pathname !== "/connect" && role !== "owner" && (
                                <div className="relative w-full h-14 bg-black rounded-full px-2 flex items-center overflow-hidden">
                                    <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-white font-bold text-sm">Slide to Connect</span>
                                    </motion.div>
                                    <motion.div
                                        drag="x"
                                        dragConstraints={{ left: 0, right: swipeWidth }}
                                        dragElastic={0.1}
                                        onDragEnd={handleDragEnd}
                                        style={{ x }}
                                        className="relative z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center pb-4">
                            <div className="w-10 h-1 rounded-full bg-gray-200" />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};