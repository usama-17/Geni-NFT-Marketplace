import React, {useEffect, useState} from "react";
import NftCard from "../components/ui/Nft-card/NftCard";
import {Col, Container, Row, Spinner} from "reactstrap";
import {collection, getDocs, orderBy, query, where} from "firebase/firestore";
import {db} from '../firebase';
import constants from "../config/Constants.json";

const MyCollection = (props) => {
    const [myCollection, setCollection] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState("items");

    useEffect(() => {
        console.log(props)
        loadCollection().then(_items => {
            console.log('_items', _items);
            setCollection(_items);
            setFilterData(_items);
            setLoading(null);
        });
    }, []);

    const loadCollection = async () => {
        const _query = query(collection(db, constants.dbNfts), where("owner_lowerCase", "==", props.account.address), orderBy("tokenId", "asc"));
        const rawItems = await getDocs(_query);
        const skinQuery = query(collection(db, constants.dbNfts), where("type", "==", "skin"));
        const skinItems = await getDocs((skinQuery));
        let tokens = [];
        rawItems.forEach((doc) => {
            let obj = doc.data();
            obj = {...obj, id: doc.id}
            tokens.push(obj);
        });
        skinItems.forEach((doc) => {
            let obj = doc.data();
            obj = {...obj, id: doc.id}
            const owners = obj.owners;
            // const _user = "0x968bec528b1ba2ae4227f1bb0a885f4f2795949e";
            // console.log(owners[_user]);
            if (owners[props.account.address]) {
                //key is available
                console.log("key is available");
                tokens.push(obj);
            }
        })
        console.log(tokens);
        return tokens;
    }
    const handleSort = (e) => {
        const filterValue = e.target.value;
        if (filterValue === "recentlyCreated") {
            console.log(myCollection);
            const recentlyCreated = [...myCollection].sort((a, b) => b.createdAt - a.createdAt);
            console.log(recentlyCreated);
            setFilterData(recentlyCreated);
            console.log("Filtered");
        } else setFilterData(myCollection);
        if (filterValue === "recentlySold") {
        }
    };
    const handleChange = (e) => {
        if (e.target.value) {
            const searchData = myCollection.filter((item) => {
                const data = item.name.includes(e.target.value);
                if (data)
                    return data
            })
            setFilterData(searchData);
        } else
            setFilterData(myCollection);
    }
    return (
        <section className="p-0 mt-3">
            <Container>
                <Row>
                    <Col lg="12" className="">
                        <div
                            className="live__auction__top d-flex align-tokens-center justify-content-between text-white">
                            <h3>Collected Items</h3>
                            {/*<span>*/}
                            {/*  <Link to="/market">Explore more</Link>*/}
                            {/*</span>*/}
                        </div>
                    </Col>
                    <div className="row p-3">
                        <div className="col-md-3">
                            <div className="search"><input type="text"
                                                           className="form-control" placeholder="Search"
                                                           onChange={handleChange}/>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <Row>
                                <Col lg="12" className="mb-3">
                                    <div className="market__product__filter">
                                        <div className="filter__right">
                                            <select className="select_profile" onChange={handleSort}>
                                                <option>Sort By</option>
                                                <option value="recentlyCreated">Recently Created</option>
                                                <option value="recentlySold">Recently Sold</option>
                                            </select>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    {
                        loading === "items" ?
                            <div className="my-5 text-center">
                                <Spinner color="white"/>
                            </div> :
                            <>
                                {myCollection.length > 0 ?
                                    filterData.map((item) => (
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

export default MyCollection;