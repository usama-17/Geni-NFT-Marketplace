import React from "react";
import HeroSection from "../components/ui/HeroSection";
import Footer from "../components/Footer/Footer";
import LiveAuction from "../components/ui/Live-auction/LiveAuction";
import SellerSection from "../components/ui/Seller-section/SellerSection";
import Trending from "../components/ui/Trending-section/Trending";
import Collection from "../components/ui/Collection-section/Collection";
const Home = (props) => {
    return (
        <>
            <HeroSection {...props}/>
            {/*<LiveAuction />*/}
            {/*<SellerSection />*/}
            {/*<Trending />*/}
            <Collection {...props}/>
            {/*<StepSection />*/}
        </>
    );
};

export default Home;
