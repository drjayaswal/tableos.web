"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { CancelIcon, CheckIcon, EmployeeIcon, Loading, SearchIcon, WarningIcon } from "@/app/components/icons/svg";
import { useUser } from "@/app/context/UserContext";
import { apiRequest } from "@/app/utility/api";
import { toast } from "sonner";

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    storeId: string;
    createdAt: string;
    emailVerified: boolean;
}

interface ApiResponse {
    status: number;
    message: string;
    data: {
        employees?: Employee[];
        storeId?: string;
        employeeId?: string;
    };
}

type ModalMode = "create" | "update" | null;

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);

const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M1 4.5l6 4 6-4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
);


const PALETTE = [
    ["#FDDCB5", "#C27B2E"],
    ["#C7E9FB", "#2272A3"],
    ["#D5F0D0", "#2A7A3B"],
    ["#F5D0E0", "#A0365A"],
    ["#E8D5FB", "#6A35B5"],
    ["#FFEDB5", "#9A6B00"],
];

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
    const idx = name.charCodeAt(0) % PALETTE.length;
    const [bg, fg] = PALETTE[idx];
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return (
        <div
            className="flex items-center justify-center shrink-0 font-bold tracking-tight"
            style={{
                width: size,
                height: size,
                background: bg,
                color: fg,
                fontSize: size * 0.35,
                borderRadius: "50%",
            }}
        >
            {initials}
        </div>
    );
}

interface ModalProps {
    mode: ModalMode;
    employee?: Employee | null;
    onClose: () => void;
    onFire: () => void;
    onSuccess: () => void;
}

function Modal({ mode, employee, onClose, onFire, onSuccess }: ModalProps) {
    const { storeId } = useUser();
    const [form, setForm] = useState({
        name: employee?.name ?? "",
        email: employee?.email ?? "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        if (!form.name.trim()) return setError("Name is required.");
        if (mode === "create" && !form.email.trim()) return setError("Email is required.");
        if (mode === "create" && !storeId) return setError("Store not found. Please log in again.");

        setLoading(true);
        try {
            const endpoint = mode === "create" ? "/owner/create/employee" : "/owner/update/employee";
            const body = mode === "create"
                ? { name: form.name, email: form.email, storeId }
                : { name: form.name, employeeId: employee?.id };

            const res = await apiRequest<ApiResponse>(endpoint, { method: "POST", body });
            if (res.status !== 200) throw new Error(res.message);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message ?? "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-md mx-auto rounded-3xl bg-white shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 sm:px-6 py-4 sm:py-5 shrink-0">
                    <div>
                        <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                            {mode === "create" ? "Add New Employee" : "Update Employee"}
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {mode === "create" ? "Onboard a new staff member to your store" : "Edit employee profile details"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center cursor-pointer rounded-xl text-gray-400 hover:bg-pink-500/10 hover:text-pink-500 transition-colors"
                    >
                        <CancelIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-5 sm:px-6 py-5 space-y-4 overflow-y-auto scroll-smooth overscroll-contain">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full rounded-xl border font-bold border-gray-200/50 bg-white py-2.5 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:shadow-sm focus:border-gray-200 focus:outline-none transition-all"
                        />
                    </div>

                    {mode === "create" && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="e.g. rahul@store.com"
                                className="w-full rounded-xl border font-bold border-gray-200/50 bg-white py-2.5 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:shadow-sm focus:border-gray-200 focus:outline-none transition-all"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="rounded-xl flex items-center gap-2 font-bold bg-red-50 px-4 py-3 text-xs text-red-600">
                            <WarningIcon className="w-4 h-4" />{error}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
                    <Button variant="tableos" size="sm" onClick={onClose} className="text-gray-500 shadow-none! border-0! hover:bg-pink-500/10! hover:text-pink-500!">
                        Cancel
                    </Button>
                    <Button
                        variant="tableos"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-1.5">
                                <Loading className="w-5 h-5 animate-spin" />
                                {mode === "create" ? "Creating…" : "Updating…"}
                            </span>
                        ) : mode === "create" ? "Create" : "Update"}
                    </Button>
                    {mode !== "create" &&
                        <Button variant="tableos" size="sm" onClick={onFire} className="text-amber-500 shadow-none! border-0! hover:bg-amber-600/10! hover:text-amber-600!">
                            Fire
                        </Button>
                    }
                </div>
            </motion.div>
        </div>
    );
}

function EmployeeCard({ emp, onEdit }: { emp: Employee; onEdit: (emp: Employee) => void }) {
    return (
        <motion.div
            layout
            className="group relative rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
        >
            <Button
                onClick={() => onEdit(emp)}
                className="text-xs! h-8  absolute top-4 cursor-pointer right-4 px-3! py-2!"
                title="Edit employee"
            >
                Edit
            </Button>

            <div className="flex items-center gap-3 mb-4">
                <Avatar name={emp.name} size={44} />
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{emp.name}</p>
                    <p className="text-[11px] text-gray-400">
                        Joined {new Date(emp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                    <span className="text-gray-500 shrink-0">
                        <MailIcon />
                    </span>
                    <span className="truncate font-bold">{emp.email}</span>
                    {emp.emailVerified && (
                        <span className="ml-auto shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                            <CheckIcon className="w-3 h-3" />
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 rounded bg-gray-100" />
                    <div className="h-3 w-14 rounded-full bg-gray-100" />
                </div>
            </div>
            <div className="space-y-2.5">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50">
                <div className="h-2.5 w-24 rounded bg-gray-100" />
            </div>
        </div>
    );
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<{ mode: ModalMode; employee?: Employee | null }>({ mode: null });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await apiRequest<ApiResponse>("/owner/list/employee");
            setEmployees(res.data?.employees ?? []);
        } catch {
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };
    const fireEmployee = async (employeeId: string) => {
        setLoading(true);
        try {
            const body = { id: employeeId };
            const res = await apiRequest<ApiResponse>(`/owner/fire/employee`, {
                method: "POST",
                body: body
            });

            if (res.status !== 200) throw new Error(res.message);
            toast("Employee removed");
            fetchEmployees();
        } catch (err: any) {
            toast(err.message ?? "Something went wrong.");
        } finally {
            setModal({ mode: null });
            setLoading(false);
        }
    };
    useEffect(() => {
        if (modal.mode) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [modal.mode]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filtered = employees.filter(
        (e) =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase()) ||
            e.storeId.toLowerCase().includes(search.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
    } as const;

    return (
        <div className="h-full scroll-smooth">
            <div className="relative z-10 mx-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="flex items-center justify-center rounded-xl text-black">
                                    <EmployeeIcon className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Employees
                                </h1>
                            </div>
                            <p className="text-sm text-gray-400 ml-10.5">
                                {loading ? "Loading staff…" : `${employees.length} staff member${employees.length !== 1 ? "s" : ""} across your stores`}
                            </p>
                        </div>

                        <Button
                            variant="tableos"
                            onClick={() => setModal({ mode: "create" })}
                            className="sm:self-auto self-start"
                        >
                            <PlusIcon />
                            Add Employee
                        </Button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, email or store…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200/50 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:shadow-sm focus:border-gray-200 focus:outline-none transition-all"
                            />
                        </div>

                        {!loading && employees.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                                {search && ` for "${search}"`}
                            </div>
                        )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="mb-4 text-gray-400">
                                    <EmployeeIcon className="w-12 h-12" />
                                </div>
                                <p className="text-sm font-semibold text-gray-400">
                                    {search ? "No employees match your search" : "No employees yet"}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    {search ? "Try a different keyword" : "Click 'Add Employee' to onboard your first staff member"}
                                </p>
                                {!search && (
                                    <div className="mt-5">
                                        <Button variant="tableos" size="sm" onClick={() => setModal({ mode: "create" })}>
                                            <PlusIcon />
                                            Add first employee
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((emp) => (
                                        <EmployeeCard
                                            key={emp.id}
                                            emp={emp}
                                            onEdit={(e) => setModal({ mode: "update", employee: e })}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            <AnimatePresence>
                {modal.mode && (
                    <Modal
                        mode={modal.mode}
                        onFire={() => fireEmployee(modal.employee?.id ?? "")}
                        employee={modal.employee}
                        onClose={() => setModal({ mode: null })}
                        onSuccess={fetchEmployees}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}