import React from 'react';

interface TabComponentProps {
    activeTab: string;
    tabs: string[],
    onTabChange: (tab: string) => void;
}


const TabComponent: React.FC<TabComponentProps> = ({ activeTab, onTabChange,tabs }) => {
    return (
        <div className="flex w-full justify-center gap-2 bg-[var(--parchment)] rounded-lg shadow-sm p-2 mb-4 mt-4">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`flex-1 rounded px-4 py-1 text-xs font-main text-center transition-all duration-200 ease-in-out
                        ${
                            activeTab === tab
                                ? 'bg-white shadow text-[var(--espresso-black)] border-b-2 border-[var(--espresso-black)]'
                                : 'bg-transparent text-[var(--espresso-black)/70] hover:bg-white hover:shadow hover:text-[var(--espresso-black)] hover:border-b-2 hover:border-[var(--espresso-black)]'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default TabComponent;
