import type { NotifAttributes } from "@/interfaces/global";

const NotifComponent = ({ item }: { item: NotifAttributes }) => {
    return (
        <div className="w-full bg-white border-l-4 border-barako-light shadow-xl rounded-lg p-4 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
            <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">
                {item.type || "Notification"}
            </span>
            <span className="text-xs text-gray-400">
                {item.id}
            </span>
            </div>
            <div className="font-semibold text-gray-800 text-base">
                {item.title}
            </div>
            <div className="text-gray-600 text-sm">
                {item.message}
            </div>
            <div className="text-xs font-medium mt-2">
                {item.read ? (
                    <span className="text-gray-500">Read</span>
                ) : (
                    <span className="text-amber-500">Unread</span>
                )}
            </div>
        </div>

    );
}

export default NotifComponent;