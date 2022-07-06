import React from "react";
import {Navigate, Route, Routes, useSearchParams} from "react-router-dom";
import Home from "../pages/Home";
import Market from "../pages/Market";
import Create from "../pages/Create";
import Contact from "../pages/Contact";
import Profile from "../pages/Profile";
import Wallet from "../pages/Wallet";
import CharacterDetails from "../pages/CharacterDetails";
import SkinDetails from "../pages/SkinDetails";
import Staking from "../pages/Staking";
import StakingDetail from "../pages/StakingDetail";
import Mint from "../pages/Mint";

const Routers = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo');
    const poolId = localStorage.getItem("poolId");
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" {...props} />}/>

            <Route path="/home" element={<Home {...props} />}/>
            <Route path="/market" element={<Market {...props} />}/>
            <Route path="/stakes"
                   element={<Staking{...props}/>}/>
            <Route path="/create"
                   element={props.account ? <Create {...props}/> : <Navigate to="/wallet?redirectTo=/create"/>}/>
            <Route path="/mint"
                   element={<Mint {...props}/>}/>
            <Route path="/contact" element={<Contact {...props} />}/>
            <Route path="/profile"
                   element={props.account ? <Profile {...props}/> : <Navigate to="/wallet?redirectTo=/profile"/>}/>
            <Route path="/wallet"
                   element={props.account ? <Navigate to={redirectTo ? redirectTo : '/home'}/> : <Wallet {...props}/>}/>
            {/*<Route path="/wallet" element={<Wallet {...props} />}/>*/}
            <Route path="/assets/character/:id" element={<CharacterDetails {...props} />}/>
            <Route path="/assets/skin/:id" element={<SkinDetails {...props} />}/>
            <Route path="/StakingDetail/:id" element={props.account ? <StakingDetail {...props} /> :
                <Navigate to={`/wallet?redirectTo=/StakingDetail/${poolId}`}/>}/>
        </Routes>
    );
};

export default Routers;
