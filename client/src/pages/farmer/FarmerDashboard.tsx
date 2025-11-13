import DashboardHeader from "@/components/DashboardHeader";
import type { Stat, CardAttributes } from "@/interfaces/global";
import CardComponent from "@/components/CardComponent";
import StatCard from "@/components/StatCard";
import type React from "react";
import { useEffect, useState } from "react";
import logo2 from "@/assets/images/logo.svg";
import { supabase } from "@/lib/supabaseClient";
import BeanImageExtractor from "@/components/BeanImageExtractor";
import {
    BeanSizeDistribution,
    FarmComparison
} from "@/components/farmer/FarmerCharts";

const FarmerDashboard: React.FC = () => {

    const [farmerStats, setFarmerStats] = useState<any>(null);
    const [globalStats, setGlobalStats] = useState<any>(null);
    const [sizeDistribution, setSizeDistribution] = useState<any[]>([]);
    const [sizeThresholds, setSizeThresholds] = useState<any>(null);
    const [farmComparison, setFarmComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data: sessionData } = await supabase.auth.getSession();
                const uiid = sessionData.session?.user?.id;

                if (!uiid) {
                    console.error('No user ID found in session');
                    return;
                }

                const apiUrl = `${import.meta.env.VITE_HOST_BE}/api/analytics/farmer/dashboard/${uiid}`;
                console.log('Fetching from:', apiUrl);

                const response = await fetch(apiUrl);
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server error response:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const responseText = await response.text();
                    console.error('Non-JSON response received:', responseText.substring(0, 200));
                    throw new Error('Server returned non-JSON response');
                }

                const data = await response.json();

                console.log("📊 Dashboard Data:", data); // log JSON for debugging

                setFarmerStats(data.farmer);
                setGlobalStats(data.global);
                setSizeDistribution(data.size_distribution || []);
                setSizeThresholds(data.size_thresholds || null);
                setFarmComparison(data.farm_comparison || null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-accent">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    //  Stat cards → quick KPIs (avg size, yield, density, shape consistency)
    const statCards: Stat[] = farmerStats
        ? [
            {
                label: "Average Bean Area",
                value: `${farmerStats.average_area.toFixed(1)} mm²`,
                subtext: (() => {
                    const diff = farmerStats.average_area - globalStats.average_area;
                    const percent = ((diff / globalStats.average_area) * 100).toFixed(1);
                    return `${Number(percent) > 0 ? "+" : ""}${percent}% vs other farms`;
                })()
            },
            {
                label: "Average Bean Length",
                value: `${farmerStats.average_size.length_mm.toFixed(1)} mm`,
                subtext: (() => {
                    const diff = farmerStats.average_size.length_mm - globalStats.average_size.length_mm;
                    const percent = ((diff / globalStats.average_size.length_mm) * 100).toFixed(1);
                    return `${Number(percent) > 0 ? "+" : ""}${percent}% vs other farms`;
                })()
            },
            {
                label: "Average Bean Width",
                value: `${farmerStats.average_size.width_mm.toFixed(1)} mm`,
                subtext: (() => {
                    const diff = farmerStats.average_size.width_mm - globalStats.average_size.width_mm;
                    const percent = ((diff / globalStats.average_size.width_mm) * 100).toFixed(1);
                    return `${Number(percent) > 0 ? "+" : ""}${percent}% vs other farms`;
                })()
            },
            {
                label: "Total Bean Count",
                value: farmerStats.total_bean_count.toString(),
                subtext: "Total beans submitted"
            }
        ]
        : [];

    // Chart cards → interactive visual exploration
    const chartCards: CardAttributes[] = farmerStats ? [
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
                {farmerStats?.largest_bean ? (
                    <BeanImageExtractor
                    bean={{
                        bean_id: farmerStats.largest_bean.bean_id,
                        length_mm: farmerStats.largest_bean.length_mm,
                        width_mm: farmerStats.largest_bean.width_mm,
                        bbox: [
                        farmerStats.largest_bean.bbox_x,
                        farmerStats.largest_bean.bbox_y,
                        farmerStats.largest_bean.bbox_width,
                        farmerStats.largest_bean.bbox_height,
                        ]
                    }}
                    imageSrc={farmerStats.largest_bean.image_url}
                    size={240}
                    />
                ) : (
                    <img src={logo2} alt="Largest Bean Placeholder" className="w-32 h-32" />
                )}
                </div>
            )
        }
    ] : [];

    return (
        <div className="w-full h-full max-w-7xl bg-white p-6 mx-auto">
            {/* Dashboard Header */}
            <DashboardHeader 
                title='Farmer Dashboard'
                subtitle='Manage your farm and view analytics'
                image={logo2}
            />

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statCards.map((card, i) => (
                    <StatCard key={i} label={card.label} value={card.value} subtext={card.subtext} />
                ))}
            </div>

            {/* Row 1: Largest Bean (1/3) + Bean Size Distribution (2/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-1">
                    <CardComponent item={chartCards[0]} />
                </div>
                <div className="lg:col-span-2">
                    <CardComponent 
                        item={{
                            title: "Bean Size Distribution",
                            subtitle: "How your beans compare to other farms",
                            description: sizeThresholds ? (
                                <div className="text-xs text-stone-400 mt-2">
                                    <p>Small: &lt; {sizeThresholds.small_max.toFixed(1)} mm² | Medium: {sizeThresholds.medium_min.toFixed(1)}-{sizeThresholds.medium_max.toFixed(1)} mm² | Large: &gt; {sizeThresholds.large_min.toFixed(1)} mm²</p>
                                    <p className="mt-1 text-stone-500">Based on data: Min {sizeThresholds.min_area.toFixed(1)} mm², Median {sizeThresholds.median_area.toFixed(1)} mm², Max {sizeThresholds.max_area.toFixed(1)} mm²</p>
                                </div>
                            ) : (
                                <div className="text-xs text-stone-400 mt-2">Dynamic size categories based on your data</div>
                            ),
                            content: sizeDistribution.length > 0 ? (
                                <BeanSizeDistribution data={sizeDistribution} thresholds={sizeThresholds} />
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-500">
                                    No size distribution data available
                                </div>
                            )
                        }}
                    />
                </div>
            </div>
            {/* !! TO REPLACE with smth else mayhaps*/}
            {/* Charts Grid - Row 2: Yield vs Quality & Farm Comparison */}
            <div className="mb-6">
                <CardComponent 
                    item={{
                        title: "Farm Comparison",
                        subtitle: "Compare your beans against other farms",
                        description: "See how your farm performs across key quality metrics",
                        content: farmComparison ? (
                            <FarmComparison data={farmComparison} />
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                No comparison data available
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    );
};

export default FarmerDashboard;
