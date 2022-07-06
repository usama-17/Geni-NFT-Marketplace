import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {db} from "../../../firebase";
import "./marketplace-card.css";
import "../card.css";

const MarketplaceCard = ({item, buyItem, account}) => {
    const [showModal, setShowModal] = useState(false);
    const [nft, setNft] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(null);
    const {name, docId, currentBid, creatorImg, image, owner, price, collectionId, tokenId} = item;

    useEffect(async () => {
        const itemRef = doc(db, "nfts", collectionId + tokenId);
        const nftData = await getDoc(itemRef);
        const _item = nftData.data();
        console.log(_item);
        setNft(_item);
        setUser(account);
    }, [])
    const addFav = async () => {
        setLoading("favourites");
        const index = account.favourites.indexOf(tokenId);
        const userRef = doc(db, "users", account.address);
        const itemRef = doc(db, "nfts", collectionId + tokenId);
        const favData = await getDoc(itemRef);
        const fav = favData.data();
        console.log(fav)
        if (index > -1) {
            account.favourites.splice(index);
            await setDoc(userRef, {favourites: account.favourites}, {merge: true});
            await setDoc(itemRef, {favourites: fav.favourites - 1}, {merge: true});
            const obj = {...nft, favourites: nft.favourites - 1}
            setNft(obj);
            setUser(account);
            setLoading(null);
        } else {
            account.favourites.push(item.tokenId);
            await setDoc(userRef, {favourites: account.favourites}, {merge: true});
            await setDoc(itemRef, {favourites: fav.favourites + 1}, {merge: true});
            const obj = {...nft, favourites: nft.favourites + 1}
            setNft(obj);
            setUser(account);
            setLoading(null);
        }
    }
    return (
        <div className="single__nft__card h-100">
            <div className="nft__img">
                <Link className="text-white text-decoration-none" to={`/assets/${collectionId + tokenId}`}>
                    <img src={image} alt="" className="w-100"/>
                </Link>
            </div>

            <div className="nft__content">
                <h5 className="mb-0">
                    <Link className="text-white text-decoration-none"
                          to={`/assets/${collectionId + tokenId}`}>{name}</Link>
                </h5>

                <hr/>

                <div className="d-flex justify-content-between align-items-end mb-3">
                    <p>{loading === "favourites" ?
                        <div className=" spinner-border-sm spinner-border text-secondary p-1 mx-1"
                             role="status">
                            <span className="sr-only">Loading...</span>
                        </div> :
                        user ? user.favourites.includes(item.tokenId) ?
                            <button className="fas fa-heart me-2 bg-transparent border-0"
                                    disabled={loading === "favourites"}
                                    onClick={addFav}/> :
                            <button className="far fa-heart me-2 bg-transparent border-0"
                                    disabled={loading === "favourites"}
                                    onClick={addFav}/> :
                            <button className="far fa-heart me-2 bg-transparent border-0"/>}{nft.favourites}
                    </p>
                    <div className="text-end">
                        <div className="small text-muted">Price</div>
                        <h5 className="mb-0 text-white"><i className="fab fa-ethereum me-2"/> {price}</h5>
                    </div>
                </div>

                {/*<div className="creator__info-wrapper d-flex gap-3">*/}
                {/*    <div className="creator__img">*/}
                {/*        <img src={creatorImg} alt="" className="w-100"/>*/}
                {/*    </div>*/}

                {/*    <div className="creator__info w-100 d-flex align-items-center justify-content-between">*/}
                {/*        <div>*/}
                {/*            <h6>Created By</h6>*/}
                {/*            <p>{creator}</p>*/}
                {/*        </div>*/}

                {/*        {currentBid && <div>*/}
                {/*            <h6>Current Bid</h6>*/}
                {/*            <p>{currentBid} ETH</p>*/}
                {/*        </div>}*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div className=" mt-3 d-flex align-items-center justify-content-between">*/}
                {/*    <button*/}
                {/*        className="bid__btn d-flex align-items-center gap-1"*/}
                {/*        onClick={() => setShowModal(true)}*/}
                {/*    >*/}
                {/*        <i className="ri-shopping-bag-line"/> Place Bid*/}
                {/*    </button>*/}

                {/*    {showModal && <Modal setShowModal={setShowModal}/>}*/}

                {/*    <span className="history__link">*/}
                {/*        <Link to="#">View History</Link>*/}
                {/*    </span>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default MarketplaceCard;
