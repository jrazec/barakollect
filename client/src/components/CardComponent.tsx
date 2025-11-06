import type { CardAttributes } from "@/interfaces/global";

const CardComponent = ({ item }: { item: CardAttributes }) => {
    return (
        <>
            {(item.side) ?
                <div className="bg-[var(--parchment)] rounded-lg shadow p-4 h-full flex flex-col">
                    <div className="w-full flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-main font-bold text-[var(--espresso-black)] text-sm">{item.title}</span>
                        </div>
                        <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">{item.subtitle}</div>
                        <div className="flex w-full items-center gap-4">
                            <div className="bg-[var(--white)] rounded-md shadow p-2">
                                {item.side}
                            </div>
                            <div className="flex-1 min-h-0 flex items-center justify-center">
                            {item.content}
                            </div>
                        </div>

                        {item.description
                            &&
                            <div className="flex gap-2 mt-2 text-xs text-stone-400">
                                <span>{item.description}</span>
                            </div>
                        }
                    </div>
                </div>
                :
                <div className="bg-[var(--parchment)] rounded-lg shadow p-4 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-main font-bold text-[var(--espresso-black)] text-sm">{item.title}</span>
                    </div>
                    <div className="text-xs font-accent text-[var(--espresso-black)] mb-2">{item.subtitle}</div>
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                        {item.content}
                    </div>

                    {item.description
                        &&
                        <div className="flex gap-2 mt-2 text-xs text-stone-400">
                            <span>{item.description}</span>
                        </div>
                    }
                </div>
            }

        </>

    );
}

export default CardComponent;