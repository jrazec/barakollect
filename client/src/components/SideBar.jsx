import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineFileUpload } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import { FaRegMap } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
    

const SideBar = ({ show }) => {
    return (
        <div className={ show ? "sideNav active" : "sideNav"}>

            <div className="userInfo">
                <img src="/user.png" alt="User Avatar" className="userAvatar" />
                <div className= "userName&Role">
                    <p className="userName">Carlos Yajie Fetizanan</p>
                    <p className="userRole">Farmer</p>
                </div>
            </div>
            <div className="midSection">
                <div className="Nav">
                    <ul>
                        <li className="navigationBtn">
                            <a href="/" className="navLink">
                                <LuLayoutDashboard className="icon" />
                                <span className="lblNav">Dashboard</span>
                            </a>
                            </li>
                        </ul>
                        <ul>
                            <li className ="navigationBtn">
                                <a href="/" >
                                <MdOutlineFileUpload className="icon" />
                                <span className="lblNav">Upload Images</span>
                                </a>
                            </li>
                        </ul>
                        <ul>
                            <li className="navigationBtn">
                                <a href="/">
                                 <GrGallery className="icon" />
                                 <span className="lblNav">Beans Gallery</span>
                                 </a>
                            </li>
                        </ul>
                        <ul>
                            <li className="navigationBtn">
                                 <a href="/">
                                <FaRegMap className="icon" />
                                <span className="lblNav">Farm Map</span>
                                </a>
                            </li>
                        </ul>
                        <ul>
                            <li className="navigationBtn">
                                <a href="/">
                                <IoMdNotificationsOutline className="icon" /> 
                                <span className="lblNav">Notifications</span>
                                </a>
                        </li>
                    </ul>
                </div>
            </div>  
            <div className="bottomSection">
                    <ul>
                        <li className="navigationBtn">
                            <a href="/">
                                <CiLogout className="icon" />
                                <span className="lblNav">Logout</span>
                            </a>
                        </li>
                    </ul>
            </div>
        </div>
    )
}

export default SideBar