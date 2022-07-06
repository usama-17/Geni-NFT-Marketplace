import React, {useEffect, useState} from "react";
import {Button, ButtonGroup, Col, Container, Row, Spinner} from "reactstrap";
import "../styles/market.css";
import {collection, getDocs, query} from "firebase/firestore";
import {db} from "../firebase";
import NftCard from "../components/ui/Nft-card/NftCard";
import Multiselect from 'multiselect-react-dropdown';
import {useNavigate} from 'react-router-dom';

const Market = ({marketplace, characters, web3, account}) => {
    const [data, setData] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState("items");
    const [showingCollection, setShowingCollection] = useState("character");
    const [nameSearchData, setNameSearchData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCollectionItems().then(_items => {
            console.log('_items', _items);
            setData(_items);
            setLoading(null);
        });
    }, []);

    useEffect(() => {
        setItems(data.filter(_d => _d.type === showingCollection));
        // setItems(data);
    }, [data, showingCollection]);

    // useEffect(()=>{
    //     setNameSearchData(data.map(e => e));
    //     console.log(data.map(e => e.name));
    // },[data])

    const loadCollectionItems = async () => {
        let _items = [];

        const q = query(collection(db, "nfts"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            // console.log(doc.id, " => ", doc.data());
            let obj = {...doc.data(), id: doc.id}
            _items.push(obj)
        });
        return _items;
    }
    const handleSearch = async (e) => {
        if (e.target.value) {
            const searchData = data.filter((item) => {
                const _data = item.name.includes(e.target.value);
                if (_data)
                    return _data
            })
            setItems(searchData);
        } else
            setItems(data);
    }



    const buyMarketItem = async (item) => {
        // await (await marketplace.purchaseItem(item.itemId, {value: item.totalPrice})).wait();
        // loadMarketplaceItems().then(_items => {
        //     console.log('_items', _items);
        //     setItems(_items);
        //     setLoading(null);
        // });
    }
    const selectOption = () => {
        console.log("Selected");
    }

    return (
        <section style={{marginBottom:"100px", marginTop:"100px"}}>
            <Container>
                <Row>
                        <Col lg="2" className="mb-3">
                            <div className="market__product__filter">
                                <div className="filter__right">
                                    <select className="select_profile" onChange={(e)=>setShowingCollection(e.target.value)}>
                                        <option>Select</option>
                                        <option value="skin">Skins</option>
                                        <option value="character">Character</option>
                                    </select>
                                </div>
                            </div>
                        </Col>

                    <Col lg={4} className="mb-4">
                        <div className="col-md-6 w-50">
                            <div className="search">
                                <Multiselect
                                    className="text-white form-control-alternative"
                                    onSelect={(list, item) => {
                                        console.log(item);
                                        navigate(`/assets/${item.type}/${item.collection + item.tokenId}`);
                                    }}
                                    hidePlaceholder={true}
                                    selectionLimit={1}
                                    placeholder="Search by name"
                                    options={data}
                                    displayValue="name"
                                    // singleSelect
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    {/*<Col lg={2} md={3}>*/}
                    {/*    <div className="p-3 bg-light rounded">*/}
                    {/*        <div className="mb-3">*/}
                    {/*            <p className="lead">View Items</p>*/}
                    {/*            <hr className="mt-0"/>*/}
                    {/*            <ButtonGroup vertical className="w-100">*/}
                    {/*                <Button className="text-start ted"  color="success"*/}
                    {/*                        outline={showingCollection !== 'skin'}*/}
                    {/*                        onClick={() => setShowingCollection('skin')}*/}
                    {/*                >*/}
                    {/*                    Skins*/}
                    {/*                </Button>*/}
                    {/*                <Button className="text-start"  color="success"*/}
                    {/*                        outline={showingCollection !== 'character'}*/}
                    {/*                        onClick={() => setShowingCollection('character')}*/}
                    {/*                >*/}
                    {/*                    Characters*/}
                    {/*                </Button>*/}
                    {/*            </ButtonGroup>*/}
                    {/*        </div>*/}
                    {/*        <div className="mb-3">*/}
                    {/*            <p className="lead">Filters</p>*/}
                    {/*            <hr className="mt-0"/>*/}
                    {/*            <p className="subtext">To be added later</p>*/}
                    {/*            /!*<div className="market__product__filter">*!/*/}
                    {/*            /!*    <div className="filter__right">*!/*/}
                    {/*            /!*        <select onChange={handleSort}>*!/*/}
                    {/*            /!*            <option>Sort By</option>*!/*/}
                    {/*            /!*            <option value="high">High Rate</option>*!/*/}
                    {/*            /!*            <option value="mid">Mid Rate</option>*!/*/}
                    {/*            /!*            <option value="low">Low Rate</option>*!/*/}
                    {/*            /!*        </select>*!/*/}
                    {/*            /!*    </div>*!/*/}
                    {/*            /!*</div>*!/*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</Col>*/}
                    <Col lg={12} md={9}>
                        {
                            loading === 'items' ?
                                <div className="text-center w-100 py-5 mt-5">
                                    <Spinner color="white"/>
                                </div> :
                                <div className="row row-cols-1 row-cols-md-4 row-cols-lg-4 g-4">
                                    {items.length > 0 ?
                                        items.map((item) => (
                                            <Col>
                                                <NftCard item={item} account={account} web3={web3} key={item.tokenId}/>
                                            </Col>
                                        )) :
                                        <div className="w-100 text-center text-dark">
                                            No items available
                                        </div>
                                    }
                                </div>
                        }
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Market;
