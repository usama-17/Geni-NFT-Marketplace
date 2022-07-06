import React, {useEffect, useState} from "react";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../firebase";
import {Col, Container, Row, Spinner} from "reactstrap";
import NftCard from "../components/ui/Nft-card/NftCard";

import constants from "../config/Constants.json";

const Favourite = (props) => {
    const [myCollection, setCollection] = useState([]);
    const [loading, setLoading] = useState("items");

    useEffect(async () => {
        loadCollection().then(_items => {
            console.log('_items', _items);
            setCollection(_items);
            setLoading(null);
        });
    }, []);

    const loadCollection = async () => {
        let tokens = [];
        const favouritesArray = props.account.favourites;
        for (const element of favouritesArray) {
            // const _query = query(collection(db, constants.dbNfts), where("tokenId", "==", element));
            // const rawItems = await getDocs(_query);
            const docRef = doc(db, constants.dbNfts, element);
            const docSnap = await getDoc(docRef);
            let obj = {...docSnap.data(), id: docSnap.id};
            tokens.push(obj);
        }
        console.log(tokens);
        return tokens;
    }
    return (
        <section className="p-0 ">
            <Container>
                <Row>
                    <Col lg="12" className="">
                        <div
                            className="live__auction__top d-flex align-tokens-center justify-content-between text-white mb-3 mt-3">
                            <h3>Favourites</h3>
                        </div>
                    </Col>
                    {
                        loading === "items" ?
                            <div className="my-5 text-center">
                                <Spinner color="white"/>
                            </div> :
                            <>
                                {myCollection.length > 0 ?
                                    myCollection.map((item) => (
                                        <Col lg="3" md="4" sm="6" key={item.id} className="mb-4">
                                            <NftCard item={item} account={props.account} web3={props.web3}/>
                                        </Col>
                                    )) :
                                    <div className="w-100 text-center text-white">
                                        No items available
                                    </div>}
                            </>
                    }
                </Row>
            </Container>
        </section>
    )
}

export default Favourite;