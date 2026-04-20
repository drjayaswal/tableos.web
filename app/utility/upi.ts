export function generateUPILink({
    upiId,
    storeName,
    amount,
    orderId
}: {
    upiId: string;
    storeName: string;
    amount: string;
    orderId: string;
}) {
    const encodedName = encodeURIComponent(storeName);
    // Use a shorter note for better compatibility
    const encodedNote = encodeURIComponent(`Pay ${storeName}`);
    // tr = Transaction Reference ID (Internal Order ID)
    // tn = Transaction Note (Visible to user in history)
    return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&tr=${orderId}&tn=${encodedNote}&cu=INR`;
}