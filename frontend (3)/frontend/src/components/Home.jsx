import React, { useEffect, useState } from 'react';
import './Home.css';
import { apibaseurl, callApi, imgurl } from '../lib';
import ProgressBar from './ProgressBar';
import Profile from './Profile';
import UserManager from './UserManager';
import TaskManager from './TaskManager';

import ContentManager from './ContentManager';

const Home = () => {
    const [fullname, setFullname] = useState("");
    const [userId, setUserId] = useState(null);
    const [isProgress, setIsProgress] = useState("");
    const [token, setToken] = useState("");
    const [menuList, setMenuList] = useState([]);
    const [activeComponent, setActiveComponent] = useState(null);
    const [activeMenu, setActiveMenu] = useState(0);

    useEffect(()=>{
        const storedtoken = localStorage.getItem("token");
        if(!storedtoken)
            logout();
        else{
            setToken(storedtoken);
            setIsProgress(true);
            callApi("GET", apibaseurl + "/authservice/profile", null, null, loadProfile, storedtoken);
        }
    }, []);

    function loadProfile(res) {
        if(res.code == 200) {
            setUserId(res.user[0].id);
        }
        callApi("GET", apibaseurl + "/authservice/uinfo", null, null, loadUinfo, token || localStorage.getItem("token"));
    }

    function loadUinfo(res){
        setIsProgress(false);
        if(res.code != 200)
            return;
        setFullname(res.fullname);
        
        // Add hardcoded Content Publisher menu item
        const updatedMenus = [...res.menulist];
        if (!updatedMenus.find(m => m.mid === 6)) {
            updatedMenus.push({ mid: 6, menu: "Content Publisher", icon: "content.png" });
        }
        setMenuList(updatedMenus);
    }

    function logout(){
        localStorage.clear();
        window.location.replace("/");
    }

    function loadModule(mid){
        setIsProgress(true);
        setActiveMenu(mid);
        const component = {
            3: <TaskManager logout={logout} />,
            4: <UserManager logout={logout} />,
            5: <Profile logout={logout} />,
            6: <ContentManager logout={logout} userId={userId} />
        };
        setActiveComponent(component[mid]);
        setIsProgress(false);
    }

    return (
        <div className='home'>
            <div className='home-header'>
                <img src="/logo.png" alt='' />
                <div className='info'>
                    {fullname}
                    <img src="/shutdown.png" alt='' onClick={()=>logout()} />
                </div>
            </div>
            <div className='home-workspace'>
                <div className='home-menus'>
                    <ul>
                        {menuList.map((m)=>(
                            <li key={m.mid} className={activeMenu==m.mid? 'active': ''} onClick={()=>loadModule(m.mid)}>
                                {m.icon && m.icon !== "content.png" ? <img src={imgurl + m.icon} alt='' /> : <span style={{marginRight: '10px'}}>📄</span>}
                                {m.menu}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className='home-content'>{activeComponent}</div>
            </div>
            <div className='home-footer'>Copyright @ 2026. All rights reserved.</div>

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default Home;
