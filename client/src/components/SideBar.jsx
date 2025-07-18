const SideBar = () => {
    return (
        <div className="sideNav">
            <div className="topSection">
                <img src="/logo.png" alt="BaraKollect Logo" />
            </div>

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
                        <li className ="navigationBtn">
                            <img src="/dashboard.png" alt="Dashboard Icon" className="icon" />
                            <a href="/">Dashboard</a>
                        </li>
                        </ul>
                        <ul>
                            <li className ="navigationBtn">
                                <img src="/upload.png" alt="Upload Icon" className="icon" />
                                <a href="/">Upload Images</a>
                            </li>
                        </ul>
                        <ul>
                            <li className="navigationBtn">
                                <img src="/gallery.png" alt="Gallery Icon" className="icon" />
                                <a href="/">Beans Gallery</a>
                            </li>
                        </ul>
                        <ul>
                            <li className="navigationBtn">
                                <img src="/map.png" alt="Map Icon" className="icon" />
                                <a href="/">Farm Map</a>
                            </li>
                        </ul>
                        <ul>
                            <li className="navigationBtn">
                                <img src="/notification.png" alt="Notification Icon" className="icon" /> 
                                <a href="/">Notification</a>
                        </li>
                    </ul>
                </div>
            </div>  
            <div className="bottomSection">
                <ul>
                     <li className="navigationBtn">
                                <img src="/logout.png" alt="Logout Icon" className="icon" /> 
                                <a href="/">Logout</a>
                        </li>
                </ul>
            </div>  
        </div>
    )
}

export default SideBar