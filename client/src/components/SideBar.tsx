import type { NavItems, User } from "@/interfaces/global";
import { ActivityIcon, ChartBar, DatabaseIcon, ImageIcon, LayoutDashboard, LogOutIcon, MapPin, ScanFaceIcon, Settings, UploadIcon, User2Icon, PenTool } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";


const SideBar = ({ show, role, user }: { show: boolean, role: string, user: User }) => {
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const navigationItems: Record<string, NavItems[]> = {

        farmer: [
            {
                icon: (<LayoutDashboard />),
                label: "Dashboard",
                route: "/farmer/dashboard",
                active: true,
            },
            {
                icon: (<UploadIcon />),
                label: "Upload Images",
                route: "/farmer/upload-image"
            },
            {
                icon: (<ImageIcon />),
                label: "Beans Gallery",
                route: "/farmer/gallery"
            },
            {
                icon: (<MapPin />),
                label: "Farm Map",
                route: "/farmer/farm-map"
            },
            {
                icon: (<Settings />),
                label: "Settings",
                route: "/farmer/settings"
            }
        ],
        researcher: [
            {
                icon: (<LayoutDashboard />),
                label: "Dashboard",
                route: "/researcher/dashboard",
                active: true,
            },
            {
                icon: (<ChartBar />),
                label: "Analytics",
                route: "/researcher/analytics",

            },
            {
                icon: (<UploadIcon />),
                label: "Upload Images",
                route: "/researcher/upload-image"
            },
            {
                icon: (<ImageIcon />),
                label: "Beans Gallery",
                route: "/researcher/gallery"
            },
            {
                icon: (<PenTool />),
                label: "Annotations",
                route: "/researcher/annotations"
            },
            {
                icon: (<MapPin />),
                label: "Farm Map",
                route: "/researcher/farm-map"
            },
            {
                icon: (<Settings />),
                label: "Settings",
                route: "/researcher/settings"
            }
        ],
        admin: [
            {
                icon: (<LayoutDashboard />),
                label: "Dashboard",
                route: "/admin/dashboard",
                active: true,
            },
            {
                icon: (<ImageIcon />),
                label: "Beans Gallery",
                route: "/admin/gallery"
            },
            {
                icon: (<DatabaseIcon/>),
                label: "Beans Metadata",
                route: "/admin/metadata"
            },
            {
                icon: (<User2Icon />),
                label: "User Management",
                route: "/admin/user-management"
            },
            {
                icon: (<MapPin />),
                label: "Farm Management",
                route: "/admin/farm-map"
            },
            // {
            //     icon: (<Monitor />),
            //     label: "System Monitor",
            //     route: "/admin/monitoring"
            // },
            {
                icon: (<ActivityIcon />),
                label: "Activity Logs",
                route: "/admin/activity-logs"
            },
            {
                icon: (<Settings />),
                label: "Settings",
                route: "/admin/settings"
            },
        ]
    };



    const { signOut } = useAuth();

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        signOut();
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <>
            <div className={`sideNav ${show ? "expanded" : "collapsed"}`}>

                <div >

                    <div className={`userInfo ${show ? "" : "collapsed"}`}>
                        <div className={`userAvatarImg ${show ? "" : "collapsed"}`}>
                            {/* BADET */}
                            {role === 'admin' && <Settings className="userAvatar" />}
                            {role === 'researcher' && <ChartBar className="userAvatar" />}
                            {role === 'farmer' && <ScanFaceIcon className="userAvatar" />}
                        </div>
                        {show && (
                            <div className="userDetails">
                                <p className="userName">{user.name}</p>
                                <p className="userRole">{user.role}</p>
                            </div>
                        )}
                    </div>

                    <div className="midSection">
                        <div className="Nav">
                            <ul>
                                {!show
                                    ?
                                    navigationItems[role].map((item, index) => (
                                        <Link to={`${item.route}`} className={`navigationBtn ${show ? "" : "collapsed"} ${item.route === location.pathname ? "active" : ""}`} key={index}
                                            onMouseOver={(e) => {
                                                const lblNav = e.currentTarget.querySelector(".lblNav") as HTMLElement;
                                                if (lblNav) lblNav.style.display = "block";
                                            }}
                                            onMouseLeave={(e) => {
                                                const lblNav = e.currentTarget.querySelector(".lblNav") as HTMLElement;
                                                if (lblNav) lblNav.style.display = "none";
                                            }}>
                                            <a>
                                                <span className="icon" style={{ color: '#646464', opacity: 1 }}>{item.icon}</span>
                                                <span className={`lblNav ${show ? "" : "collapsed"}`}>{item.label}</span>
                                            </a>
                                        </Link>
                                    ))
                                    :
                                    navigationItems[role].map((item, index) => (
                                        <Link to={`${item.route}`} className={`navigationBtn ${show ? "" : "collapsed"} ${item.route === location.pathname ? "active" : ""}`} key={index}
                                        >
                                            <a>
                                                <span className="icon" style={{ color: '#646464', opacity: 0.7 }}>{item.icon}</span>
                                                <span className={`lblNav`} style={{ display: "block" }}>{item.label}</span>
                                            </a>
                                        </Link>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bottomSection">
                    <ul>
                        <li className={` ${show ? "" : "collapsed"}`}>
                            <button onClick={handleLogoutClick} className="button-accent w-full text-left flex items-center justify-center gap-2 text-sm" style={{ opacity: 1 }}>
                                <LogOutIcon style={{ opacity: 0.4 }} />
                                {show && <span>Logout</span>}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative z-51">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <LogOutIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                                <p className="text-sm text-gray-600">Are you sure you want to log out?</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={handleCancelLogout}
                                className="button-secondary cancel px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="px-4 py-2 text-sm font-medium text-white !bg-red-700 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default SideBar;