import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

import "./nft-card.css";
import "../card.css";
import {collection, doc, getDoc, getDocs, query, setDoc, where} from "firebase/firestore";
import {db} from "../../../firebase";
import {Spinner} from "reactstrap";
import constants from "../../../config/Constants.json";

const NftCard = ({item, account, web3, preview}) => {
    const [user, setUser] = useState(null);
    const [nft, setNft] = useState({});
    const [listing, setListing] = useState(null);
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState("items");

    const listingRef = collection(db, constants.dbListings);
    const offerRef = collection(db, constants.dbOffers);

    useEffect(async () => {
        console.log(web3);
        setUser(account);
        setNft(item);

        if (!preview) {
            const response = await Promise.all([loadListing(), loadOffer()]);
            if (response[0]) {
                setListing(response[0]);
            }
            if (response[1]) {
                setOffer(response[1]);
            }
        }

        setLoading(null);
    }, [item]);

    const loadListing = async () => {
        const q = query(
            listingRef,
            where("tokenId", "==", item.tokenId),
            where("collection", "==", item.collection),
            where("fulfilled", "==", false),
            where("cancelled", "==", false),
        );

        const querySnapshot = await getDocs(q);
        let items = [];
        querySnapshot.docs.forEach(_doc => {
            let _data = _doc.data();
            items.push(_data);
        });
        items.sort((_i, _j) => _i.price > _j.price);
        return items.length > 0 ? items[0] : null;
    }

    const loadOffer = async () => {
        const q = query(
            offerRef,
            where("tokenId", "==", item.tokenId),
            where("collection", "==", item.collection),
            where("fulfilled", "==", false),
            where("cancelled", "==", false),
        );

        const querySnapshot = await getDocs(q);

        let items = [];
        querySnapshot.docs.forEach(_doc => {
            let _data = _doc.data();
            items.push(_data);
        });
        items.sort((_i, _j) => _i.price > _j.price);
        return items.length > 0 ? items[items.length - 1] : null;
    }

    const addFav = async () => {
        setLoading("favourites");
        const index = account.favourites.indexOf(nft.id);
        const userRef = doc(db, "users", account.address);
        const itemRef = doc(db, "nfts", item.id);
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
            account.favourites.push(item.id);
            await setDoc(userRef, {favourites: account.favourites}, {merge: true});
            await setDoc(itemRef, {favourites: fav.favourites + 1}, {merge: true});
            const obj = {...nft, favourites: nft.favourites + 1}
            setNft(obj);
            setUser(account);
            setLoading(null);
        }
    }
    return (
        <>
            {
                loading === 'items' ?
                    <div className="text-center w-100 py-5 mt-5">
                        <Spinner color="white"/>
                    </div> :
                    <div className="single__nft__card">
                        <Link className="text-white text-decoration-none"
                              to={preview ? '#' : `/assets/${nft.type}/${nft.id}`}>
                            <div className="nft__img">
                                <img src={nft.image} alt="" className="card-img-top"/>
                            </div>
                        </Link>

                        <div className="card-body">
                            <h6 className="mb-0 card-title">
                                <Link className="text-card text-decoration-none"
                                      to={preview ? '#' : `/assets/${nft.type}/${nft.id}`}>
                                    {nft.name}
                                </Link>
                            </h6>
                            <div className="d-md-flex justify-content-between align-items-start mt-2">
                                <div>
                                    <span className="small text-muted">Price</span>
                                    <h6 className="text-dark">
                                        {
                                            listing ?
                                                <><i
                                                    className="fab fa-ethereum me-2 mb-0"/> {listing ? web3.utils.fromWei(listing.price, "ether") : 0}</> :
                                                'not set'
                                        }
                                    </h6>
                                    {/*<h6 className="text-white"><i className="fab fa-ethereum me-2 mb-0"/> {listing ? listing.price : 0}</h6>*/}
                                </div>
                                <div className="text-end">
                                    <span className="small text-muted">Best Offer</span>
                                    <h6 className="text-dark">
                                        {
                                            offer ?
                                                <><i
                                                    className="fab fa-ethereum me-2 mb-0"/> {offer ? web3.utils.fromWei(offer.price, "ether") : 0}</> :
                                                'not set'
                                        }
                                    </h6>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <div className="text-end">
                                <p className="text-dark">
                                    {loading === "favourites" ?
                                        <div className=" spinner-border-sm spinner-border text-secondary p-1 mx-2"
                                             role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div> :
                                        user ? user.favourites.includes(item.id) ?
                                            <button className="fas fa-heart me-2 bg-transparent border-0"
                                                    disabled={loading === "favourites"}
                                                    onClick={addFav}/> :
                                            <button className="far fa-heart me-2 bg-transparent border-0"
                                                    disabled={loading === "favourites"}
                                                    onClick={addFav}/> :
                                            <button className="far fa-heart me-2 bg-transparent border-0"/>}
                                    {nft.favourites}</p>
                            </div>
                        </div>
                    </div>
            }
        </>
    );
};

export default NftCard;
