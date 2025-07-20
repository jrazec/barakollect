import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineFileUpload } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import { FaRegMap } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { CiLogout } from "react-icons/ci";

const SideBar = ({ show }) => {
  return (
    <div className={`sideNav ${show ? "expanded" : "collapsed"}`}>
        <div >
            <div className="userInfo">
                <img src="/user.png" alt="User Avatar" className="userAvatar" />
                {show && (
                <div className="userDetails">
                    <p className="userName">Carlos Yajie Fetizanan</p>
                    <p className="userRole">Farmer</p>
                </div>
                )}
            </div>

            <div className="midSection">
                <div className="Nav">
                <ul>
                    {[
                    { icon: <LuLayoutDashboard />, label: "Dashboard" },
                    { icon: <MdOutlineFileUpload />, label: "Upload Images" },
                    { icon: <GrGallery />, label: "Beans Gallery" },
                    { icon: <FaRegMap />, label: "Farm Map" },
                    { icon: <IoMdNotificationsOutline />, label: "Notifications" }
                    ].map((item, index) => (
                    <li className={`navigationBtn ${show ? "" : "collapsed"}`} key={index}>
                        <a href="/">
                        <span className="icon">{item.icon}</span>
                        {show && <span className="lblNav">{item.label}</span>}
                        </a>
                    </li>
                    ))}
                </ul>
                </div>
            </div>
        </div>

        <div className="bottomSection">
            <ul>
            <li className={`navigationBtn ${show ? "" : "collapsed"}`}>
                <a href="/">
                <CiLogout className="icon" />
                {show && <span className="lblNav">Logout</span>}
                </a>
            </li>
            </ul>
        </div>
    </div>
  );
};

export default SideBar;
