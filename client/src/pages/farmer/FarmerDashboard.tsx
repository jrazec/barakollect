import DashboardHeader from "@/components/DashboardHeader";
import type { Stat, CardAttributes } from "@/interfaces/global";
import CardComponent from "@/components/CardComponent";
import { BarChartComponent, LineChartComponent } from "@/components/ChartComponent";
import StatCard from "@/components/StatCard";
import type React from "react";
import { useEffect } from "react";
import logo1 from "@/assets/images/barakollect_logo.svg";
import logo2 from "@/assets/images/logo.svg";
import { supabase } from "@/lib/supabaseClient";

const FarmerDashboard: React.FC = () => {

    useEffect(() => {
        const fetchData = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const uiid = sessionData.session?.user?.id;
            console.log(uiid)
            const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/analytics/farmer/dashboard/${uiid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log(data);
        };
        fetchData();
    }, []);
    const statCards: Stat[] = [
        {
            label: "Overall Farm Status",
            value: "Excellent",
            subtext: "Your submitted beans are 5mm above the average"
        },
        {
            label: "Your farm's Average Bean Size",
            value: "13.3mm",
            subtext: "length"
        },
        {
            label: "Average Bean Size among other Farms",
            value: "13.3 mm",
            subtext: "length"
        }
    ];

    const chartCards: CardAttributes[] = [
        {
            title: "Largest Bean Submitted",
            subtitle: "",
            description: (
                <button className="bg-[var(--espresso-black)] text-[var(--parchment)] px-4 py-2 rounded">
                    See bean information
                </button>
            ),
            content: (
                <div className="flex items-center justify-center h-60">
                    <img src={logo2} alt="Largest Bean" className="w-32 h-32" />
                </div>
            )
        },
        {
            title: "Bean Size Distribution",
            subtitle: "",
            description: (
                <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
                    <span>Libérica 65%</span>
                    <span>Excelsa 25%</span>
                    <span>Unclassified 10%</span>
                </div>
            ),
            content: <BarChartComponent />,
        },
        {
            title: "Average Bean Trend over Time",
            subtitle: "Size Distribution Analysis",
            description: (
                <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
                    <span>Area</span>
                    <span>Perimeter</span>
                    <span>Export Data</span>
                </div>
            ),
            content: <LineChartComponent />,
        }
        
    ];
    return (
    <div className="min-h-screen bg-[var(--mocha-beige)] pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
        <div>
            <h1 className="text-black">Farmer Dashboard</h1>
        </div>
        {/* dashb header */}
        <DashboardHeader 
            title='Farmer Dashboard'
            subtitle='Manage your farm and view analytics'
            actions={
                <div className="flex flex-col gap-2 mt-2 md:mt-0">
                    <button className="bg-[var(--espresso-black)] text-[var(--parchment)] px-4 py-2 rounded">Predict Images</button>
                    <button className="bg-[var(--espresso-black)] text-[var(--parchment)] px-4 py-2 rounded">Submit Images</button>
                    <button className="bg-[var(--espresso-black)] text-[var(--parchment)] px-4 py-2 rounded">Find Largest Bean</button>
                </div>
            }
            image={logo2}
        />
        {/* stat cards below header */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {statCards.length > 0 &&
                statCards.map(card => {
                    return <StatCard label={card.label} value={card.value} subtext={card.subtext} />;
                })
            }
        </div>

        <div className="flex gap-4 mb-6">
            <div className="flex-1 height-full">
                <CardComponent item={chartCards[0]} />
            </div>
            <div className="flex-2 height-full">
                <CardComponent item={chartCards[1]} />
            </div>
        </div>
        <CardComponent item={chartCards[chartCards.length - 1]} />
    </div>
    );
}

export default FarmerDashboard;