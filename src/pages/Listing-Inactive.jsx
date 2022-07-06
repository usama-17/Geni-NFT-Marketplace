import React, {useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from '../firebase';
import DataTable from "react-data-table-component";
import moment from "moment";
import {Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Row} from "reactstrap";
import constants from "../config/Constants.json";

const ListingInactive = (props) => {
    const [data, setData] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState("items");
    const [showingCollection, setShowingCollection] = useState("skin");
    useEffect(async () => {
        loadListing().then(_items => {
            setData(_items);
            setLoading(null);
        })
    }, []);
    useEffect(() => {
        setItems(data.filter(_d => _d.type === showingCollection));
        // setItems(data);
    }, [data, showingCollection]);

    const columns = [
        {
            name: "Token Id",
            selector: (row) => row.tokenId,
        },
        {
            name: "Price",
            selector: row => row.price,
            cell: (row) => {
                return (
                    <>
                        <i className="fab fa-ethereum me-2"/> {props.web3.utils.fromWei(row.price, 'ether')}
                    </>
                )
            },
        },
        {
            name: "Date",
            selector: (row) => moment(row.createdAt).fromNow(),
        },
    ];
    const loadListing = async _listing => {
        const query1 = query(collection(db, constants.dbListings), where("user_lowerCase", "==", props.account.address), where("fulfilled", "==", true));
        const fulfilled = await getDocs(query1);
        const query2 = query(collection(db, constants.dbListings), where("user_lowerCase", "==", props.account.address), where("cancelled", "==", true));
        const cancelled = await getDocs(query2);
        let items = [];
        fulfilled.forEach((doc) => {
            let obj = doc.data();
            obj = {...obj, id: doc.id}
            items.push(obj);
        });
        cancelled.forEach((doc) => {
            let obj = doc.data();
            obj = {...obj, id: doc.id}
            items.push(obj);
        });
        console.log(items);
        return items;
    }

    return (
        <>
            <Row>
                <Col lg={2} md={3} className="mt-4">
                    <div className="p-3 bg-light rounded">
                        <div className="mb-3">
                            <p className="lead">View Items</p>
                            <hr className="bg-primary mt-0"/>
                            <ButtonGroup vertical className="w-100">
                                <Button className="text-start" color="success"
                                        outline={showingCollection !== 'skin'}
                                        onClick={() => setShowingCollection('skin')}
                                >
                                    Skins
                                </Button>
                                <Button className="text-start" color="success"
                                        outline={showingCollection !== 'character'}
                                        onClick={() => setShowingCollection('character')}
                                >
                                    Characters
                                </Button>
                            </ButtonGroup>
                        </div>
                        <div className="mb-3">
                            <p className="lead">Filters</p>
                            <hr className="bg-primary mt-0"/>
                            <p className="subtext">To be added later</p>
                            {/*<div className="market__product__filter">*/}
                            {/*    <div className="filter__right">*/}
                            {/*        <select onChange={handleSort}>*/}
                            {/*            <option>Sort By</option>*/}
                            {/*            <option value="high">High Rate</option>*/}
                            {/*            <option value="mid">Mid Rate</option>*/}
                            {/*            <option value="low">Low Rate</option>*/}
                            {/*        </select>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </Col>
                <Col lg="10">
                    <Card className="mt-4" color="white">
                        <CardHeader className="text-dark">
                            <CardTitle tag="h4">
                                In-Active Listings
                            </CardTitle>
                        </CardHeader>
                        <DataTable
                            columns={columns}
                            data={items}
                            pagination
                            progressPending={loading}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default ListingInactive;