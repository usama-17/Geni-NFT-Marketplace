import React, {useEffect, useState} from "react";
import {Col, Container, Row, Spinner} from "reactstrap";
import {NFT__DATA} from "../../../assets/data/data";
import "./collection.css";
import NftCard from "../Nft-card/NftCard";
import {collection, getDocs, query} from "firebase/firestore";
import {db} from "../../../firebase";

const Collection = ({marketplace, nft, account, web3}) => {
    const [data, setData] = useState(NFT__DATA);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState("items");

    useEffect(() => {
        loadCollectionItems().then(_items => {
            console.log('_items', _items);
            const data = _items.slice(0, 8);
            setItems(data);
            setLoading(null);
        });
    }, []);

    const loadCollectionItems = async () => {
        let _items = [];

        const q = query(collection(db, "nfts"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            let obj = {...doc.data(), id: doc.id}
            _items.push(obj)
        });
        return _items;
    }

    return (
        <section className="mb-5">
            <Container>
                <Row className="mb-5">
                    <Col lg="12" className="mb-4">
                        <h3 className="collection__title text-dark">Our Collection</h3>
                    </Col>
                    {
                        loading === "items" ?
                            <div className="my-5 text-center">
                                <Spinner color="success"/>
                            </div> :
                            <>
                                {items.length > 0 ?
                                    items.map((item) => (
                                        <Col lg="3" md="4" sm="6" key={item.tokenId} className="mb-4">
                                            <NftCard item={item} account={account} web3={web3}/>
                                        </Col>
                                    )) :
                                    <div className="w-100 text-center text-white">
                                        No items available
                                    </div>
                                }
                            </>
                    }
                </Row>
            </Container>
        </section>
    );
};

export default Collection;
