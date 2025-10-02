import DashboardHeader from "@/components/DashboardHeader";
import type { Stat, CardAttributes } from "@/interfaces/global";
import CardComponent from "@/components/CardComponent";
import { BarChartComponent, LineChartComponent } from "@/components/ChartComponent";
import StatCard from "@/components/StatCard";
import type React from "react";
import { useEffect, useState } from "react";
import logo2 from "@/assets/images/logo.svg";
import { supabase } from "@/lib/supabaseClient";

const FarmerDashboard: React.FC = () => {

    const [farmerStats, setFarmerStats] = useState<any>(null);
    const [globalStats, setGlobalStats] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const uiid = sessionData.session?.user?.id;

            const response = await fetch(
                `${import.meta.env.VITE_HOST_BE}/api/analytics/farmer/dashboard/${uiid}`
            );
            const data = await response.json();

            console.log("📊 Dashboard Data:", data); // 🔹 log JSON for debugging

            setFarmerStats(data.farmer);
            setGlobalStats(data.global);
        };

        fetchData();
    }, []);

    // 🔹 Stat cards → quick KPIs (avg size, yield, density, shape consistency)
    const statCards: Stat[] = farmerStats
        ? [
            {
                label: "Your Avg Bean Length",
                value: `${farmerStats.average_size.length_mm.toFixed(1)} mm`,
                subtext: `vs Global ${globalStats.average_size.length_mm.toFixed(1)} mm`
            },
            {
                label: "Your Avg Bean Width",
                value: `${farmerStats.average_size.width_mm.toFixed(1)} mm`,
                subtext: `vs Global ${globalStats.average_size.width_mm.toFixed(1)} mm`
            },
            {
                label: "Yield Potential",
                value: farmerStats.yield_potential.toString(),
                subtext: "Beans detected"
            },
            {
                label: "Density (Solidity)",
                value: farmerStats.density_fullness.solidity.toFixed(2),
                subtext: "Higher = fuller beans"
            },
            {
                label: "Shape Consistency",
                value: farmerStats.shape_consistency.avg_aspect_ratio.toFixed(2),
                subtext: `Variation ±${farmerStats.shape_consistency.std_aspect_ratio.toFixed(2)}`
            }
        ]
        : [];

    // 🔹 Chart cards → interactive visual exploration
    const chartCards: CardAttributes[] = [
        {
            title: "Largest Bean Submitted",
            subtitle: "From your farm",
            description: (
                <div className="text-xs text-stone-400 mt-2">
                    Length: {farmerStats?.largest_bean.length_mm.toFixed(1)} mm, 
                    Width: {farmerStats?.largest_bean.width_mm.toFixed(1)} mm
                </div>
            ),
            content: (
                <div className="flex items-center justify-center h-60">
                    <img src={logo2} alt="Largest Bean" className="w-32 h-32" />
                </div>
            )
        },
        {
            title: "Bean Size Distribution",
            subtitle: "Compare farm vs global",
            description: (
                <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
                    <span>Length & Width</span>
                </div>
            ),
            content: <BarChartComponent />,
        },
        {
            title: "Shape & Consistency",
            subtitle: "Aspect Ratio Spread",
            description: (
                <div className="flex justify-center gap-2 mt-2 text-xs text-stone-400">
                    <span>Farmer vs Global Aspect Ratios</span>
                </div>
            ),
            content: <LineChartComponent />, // could be line or scatter
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--mocha-beige)] pt-8 pb-4 px-2 md:px-8 overflow-x-hidden">
            {/* Dashboard Header */}
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

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {statCards.map((card, i) => (
                    <StatCard key={i} label={card.label} value={card.value} subtext={card.subtext} />
                ))}
            </div>

            {/* Charts */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 height-full">
                    <CardComponent item={chartCards[0]} />
                </div>
                <div className="flex-2 height-full">
                    <CardComponent item={chartCards[1]} />
                </div>
            </div>
            <CardComponent item={chartCards[2]} />
        </div>
    );
};

export default FarmerDashboard;
