import React, {useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from '../firebase';
import DataTable from "react-data-table-component";
import {Link} from "react-router-dom";
import moment from "moment";
import {Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Row} from "reactstrap";
import constants from "../config/Constants.json";

const ListingActive = (props) => {
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
            selector: (row) => row.tokenId
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
        {
            name: "Details",
            center: true,
            minWidth: "20%",
            cell: (row) => (
                <>
                    <Link
                        to={`/assets/${row.type}/${row.collection + row.tokenId}`}
                    >
                        <button className="btn btn-sm py-0 w-100"
                                style={{border: "1px solid #89B450", color: "#89B450"}}>
                            <i className="ri-eye-fill"/>
                        </button>
                    </Link>
                </>
            ),
        }
    ];
    const loadListing = async _listing => {
        const _query = query(collection(db, constants.dbListings), where("user_lowerCase", "==", props.account.address.toLowerCase()), where("fulfilled", "==", false), where("cancelled", "==", false));
        const rawItems = await getDocs(_query);
        let items = [];
        rawItems.forEach((doc) => {
            // let obj = doc.data();
            // obj = {...obj, id: doc.id}
            items.push(doc.data());
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
                    <Card className="mt-4" color="light">
                        <CardHeader className="offerCardHeader">
                            <CardTitle tag="h4">
                                Active Listings
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

export default ListingActive;