import type { CardAttributes } from "@/interfaces/global";

const CardComponent = ({ item }: { item: CardAttributes }) => {
    return (
        <>
        <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-1">
                <span className="font-main font-bold text-[var(--espresso-black)] text-sm">{item.title}</span>
            </div>
            <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">{item.subtitle}</div>
            <div className="flex items-center justify-center h-60">
                {item.content}
            </div>

            {item.description
                &&
                <div className="flex gap-2 mt-2 text-xs text-stone-400">
                    <span>{item.description}</span>
                </div>
            }

        </div>
        </>

    );
}

export default CardComponent;