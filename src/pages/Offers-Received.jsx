import React, {useEffect, useState} from "react";
import DataTable from "react-data-table-component";
import {Button, ButtonGroup, Card, CardHeader, CardTitle, Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import moment from "moment";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase";
import constants from "../config/Constants.json";

const OffersReceived = (props) => {
    const [data, setData] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState("items");
    const [showingCollection, setShowingCollection] = useState("skin");
    useEffect(async () => {
        loadOffers().then(_items => {
            setData(_items);
            setLoading(null);
        })
    }, []);
    useEffect(() => {
        setItems(data.filter(_d => _d.type === showingCollection));
        // setItems(data);
    }, [data, showingCollection]);
    const loadOffers = async _listing => {
        const _query = query(collection(db, constants.dbOffers), where("currentOwner_lowerCase", "==", props.account.address.toLowerCase()));
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
    const columns = [
        {
            name: "Token Id",
            selector: (row) => row.tokenId,
        },
        {
            name: "Collection",
            selector: (row) => row.collection.toUpperCase().substring(0, 10),
        },
        {
            name: "Price",
            selector: row => row.price,
            cell: (row) => {
                return (
                    <>
                        <i className="fab fa-ethereum me-2"/> {props.web3.utils.fromWei(row.price.toString(), 'ether')}
                    </>
                )
            },
        },
        {
            name: "From",
            selector: (row) => row.user.toUpperCase().substring(0, 10),
        },
        {
            name: "Expiration",
            selector: (row) => moment(Number(row.expiry)).fromNow(),
        },
        {
            name: "Received",
            selector: (row) => moment(row.createdAt).fromNow(),
        },
        {
            name: "Details",
            center: true,
            minWidth: "10%",
            cell: (row) => (
                <>
                    <Link
                        to={`/assets/${row.type}/${row.collection + row.tokenId}`}
                    >
                        <button className="btn btn-sm  py-0 w-100"
                                style={{border: "1px solid #89B450", color: "#89B450"}}>
                            <i className="ri-eye-fill"/>
                        </button>
                    </Link>
                </>
            ),
        }
    ];
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
                                Offers Received
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

export default OffersReceived;