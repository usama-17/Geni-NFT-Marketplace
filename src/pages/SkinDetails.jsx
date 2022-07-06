import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {
    AccordionBody,
    AccordionHeader,
    AccordionItem,
    Alert,
    Badge,
    Button,
    ButtonGroup,
    Col,
    Container,
    Row,
    Spinner,
    Table,
    UncontrolledAccordion,
    UncontrolledTooltip
} from "reactstrap";
import {collection, doc, getDoc, getDocs, orderBy, query, setDoc, where} from "firebase/firestore";
import moment from "moment";
import {db} from '../firebase';
import constants from "../config/Constants.json";
import "../styles/nft-details.css";
import {prettifyEvent, substringAddress} from "../util/UtilityMethods";
import _ from "lodash";
import Swal from 'sweetalert2';

const SkinDetails = ({account, web3, skins, coin, marketplace}) => {
    const [item, setItem] = useState({});
    const [listing, setListing] = useState(null);
    const [listings, setListings] = useState([]);
    const [offer, setOffer] = useState(null);
    const [offers, setOffers] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState("items");
    const [user, setUser] = useState({});
    const [transaction, setTransaction] = useState(null);
    const [hasError, setHasError] = useState(false);

    const {id} = useParams();
    const navigate = useNavigate();

    const nftsRef = collection(db, "nfts");
    const listingRef = collection(db, constants.dbListings);
    const offerRef = collection(db, constants.dbOffers);
    const activityRef = collection(db, constants.dbActivity);

    useEffect(() => {
        loadNft().then(async _nft => {
            setItem(_nft);

            loadListings(_nft).then(_data => {
                setListing(_data.currentListing);
                setListings(_data.listings);
            });
            loadOffers(_nft).then(_data => {
                setOffer(_data.currentOffer);
                setOffers(_data.offers);
            })
            loadActivity(_nft).then(_activity => setActivity(_activity))
            setLoading(null);
        });
        setUser(account);
    }, []);

    const loadNft = async () => {
        const docRef = doc(db, constants.dbNfts, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {...docSnap.data(), id: docSnap.id};
        } else {
            navigate(-1);
        }
    }
    const loadOffers = async _nft => {
        const q = query(
            offerRef,
            where("tokenId", "==", _nft.tokenId),
            where("collection", "==", _nft.collection),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        let items = [], currentOffer = null;
        querySnapshot.docs.forEach(_doc => {
            let _data = _doc.data();
            if (!_data.fulfilled && !_data.cancelled) {
                currentOffer = _data;
            }
            items.push(_data);
        });

        return {currentOffer: currentOffer, offers: items};
    }
    const loadListings = async _nft => {
        const q = query(
            listingRef,
            where("tokenId", "==", _nft.tokenId),
            where("collection", "==", _nft.collection),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        let items = [], currentListing = null;
        querySnapshot.docs.forEach(_doc => {
            let _data = _doc.data();
            if (!_data.fulfilled && !_data.cancelled) {
                currentListing = _data;
            }
            items.push(_data);
        });

        return {currentListing: currentListing, listings: items};
    }
    const loadActivity = async _nft => {
        const q = query(
            activityRef,
            where("collection", "==", _nft.collection),
            where("tokenId", "==", _nft.tokenId),
            orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const items = [];
        querySnapshot.docs.forEach(_doc => {
            items.push(_doc.data());
        });

        return items;
    }
    const addFav = async () => {
        setLoading("favourites");
        const index = account.favourites.indexOf(item.id);
        const userRef = doc(db, "users", account.address);
        const itemRef = doc(db, "nfts", item.id);
        const favData = await getDoc(itemRef);
        const fav = favData.data();
        console.log(fav)
        if (index > -1) {
            account.favourites.splice(index);
            await setDoc(userRef, {favourites: account.favourites}, {merge: true});
            await setDoc(itemRef, {favourites: fav.favourites - 1}, {merge: true});
            const obj = {...item, favourites: item.favourites - 1}
            setItem(obj);
            setUser(account);
            setLoading("null");
        } else {
            account.favourites.push(item.id);
            await setDoc(userRef, {favourites: account.favourites}, {merge: true});
            await setDoc(itemRef, {favourites: fav.favourites + 1}, {merge: true});
            const obj = {...item, favourites: item.favourites + 1}
            setItem(obj);
            setUser(account);
            setLoading("null");
        }
        console.log(account)
    }
    const makeOffer = async () => {
        console.log("Making Offer");
        setLoading("offering");
        const {value: formValues} = await Swal.fire({
            title: 'Make Offer',
            html:
                '<input id="swal-input1" class="swal2-input" type="number" placeholder="Price (ETH)"/> ' +
                '<input id="swal-input2" class="swal2-input" type="number" placeholder="Quantity"/>' +
                '<select id="swal-input3" class="swal2-input" aria-label="Default select example">\n' +
                '  <option selected disabled>Expiry Date</option>\n' +
                '  <option value="6Hours">6 Hours</option>\n' +
                '  <option value="12Hours">12 Hours</option>\n' +
                '  <option value="1Day">1 Day</option>\n' +
                '  <option value="7Days">7 Days</option>\n' +
                '</select>',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ]
            }
        });

        if (formValues) {
            const price = parseFloat(formValues[0]);
            const quantity = parseFloat(formValues[1]);
            let expiry = formValues[2];
            switch (expiry) {
                case "6Hours":
                    expiry = Number(Date.now() + 21600000);
                    break;
                case "12Hours":
                    expiry = Number(Date.now() + 43200000);
                    break;
                case "1Day":
                    expiry = Number(Date.now() + 86400000);
                    break;
                case "7Days":
                    expiry = Number(Date.now() + 604800000);
                    break;
            }

            if (price && quantity) {
                try {
                    console.log("Reached Here");
                    const _price = Number(price) * Number(quantity) + 100000000000000000;
                    console.log(_price);
                    coin.methods.increaseAllowance(marketplace.options.address, web3.utils.toWei(String(_price), "ether")).send({from: account.address})
                        .on('transactionHash', function (hash) {
                            setTransaction(hash);
                        })
                        .on('confirmation', function (confirmationNumber, receipt) {
                            if (confirmationNumber === constants.transactionLimit) {
                                console.log(receipt);
                                marketplace.methods.makeSkinsOffer(item.tokenId, web3.utils.toWei(String(price), "ether"), quantity, expiry).send({
                                    from: account.address
                                })
                                    .on('transactionHash', function (hash) {
                                        setTransaction(hash);
                                    })
                                    .on('confirmation', function (confirmationNumber, receipt) {
                                        window.location.reload();
                                    })
                                    .on('receipt', function (receipt) {
                                        // receipt example
                                        console.log(receipt);
                                    })
                                    .on('error', function (error, receipt) {
                                        setHasError(true);
                                        setLoading(null);
                                        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                                    });
                            }
                        })
                        .on('receipt', function (receipt) {
                            // receipt example
                            console.log(receipt);
                        })
                        .on('error', function (error, receipt) {
                            setHasError(true);
                            setLoading(null);
                            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                        });
                } catch (e) {
                    setLoading(null);
                    console.log(e);
                }
            } else {
                setLoading(null);
            }
        } else {
            setLoading(null);
        }
    }
    const acceptOffer = async (offerId) => {
        console.log("Accepting Offer");
        setLoading("acceptingOffer");

        try {
            skins.methods.setApprovalForAll(marketplace.options.address, true).send({from: account.address})
                .on('transactionHash', function (hash) {
                    setTransaction(hash);
                })
                .on('confirmation', function (confirmationNumber, receipt) {
                    if (confirmationNumber === constants.transactionLimit) {
                        console.log(receipt);
                        marketplace.methods.fulfillSkinsOffer(offerId).send({
                            from: account.address
                        })
                            .on('transactionHash', function (hash) {
                                setTransaction(hash);
                            })
                            .on('confirmation', function (confirmationNumber, receipt) {
                                window.location.reload();
                            })
                            .on('receipt', function (receipt) {
                                // receipt example
                                console.log(receipt);
                            })
                            .on('error', function (error, receipt) {
                                setHasError(true);
                                setLoading(null);
                                // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                            });
                    }
                })
                .on('receipt', function (receipt) {
                    // receipt example
                    console.log(receipt);
                })
                .on('error', function (error, receipt) {
                    setHasError(true);
                    setLoading(null);
                    // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                });
        } catch (e) {
            setLoading(null);
            console.log(e);
        }
    }
    const cancelOffer = async (offerId) => {
        if (account) {
            try {
                setLoading('cancelOffer');
                marketplace.methods.cancelSkinsOffer(Number(offerId)).send({
                    from: account.address,
                })
                    .on('transactionHash', function (hash) {
                        setTransaction(hash);
                    })
                    .on('confirmation', function (confirmationNumber, receipt) {
                        window.location.reload();
                    })
                    .on('receipt', function (receipt) {
                        // receipt example
                        console.log(receipt);
                    })
                    .on('error', function (error, receipt) {
                        setLoading(null);
                        setHasError(true);
                        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    });
                // console.log(response);
            } catch (e) {
                setLoading(null);
                console.log(e);
            }
        } else {
            console.log('Wallet not connected');
        }
    }
    const sell = async () => {
        setLoading('selling');
        const {value: formValues} = await Swal.fire({
            title: 'Make Offer',
            html:
                '<input id="swal-input1" class="swal2-input" type="number" placeholder="Price (ETH)"/> ' +
                '<input id="swal-input2" class="swal2-input" type="number" placeholder="Quantity"/>',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value
                ]
            }
        });

        if (formValues) {
            const price = parseFloat(formValues[0]);
            const quantity = parseFloat(formValues[1]);

            if (price && quantity) {
                try {
                    skins.methods.setApprovalForAll(marketplace.options.address, true).send({from: account.address})
                        .on('transactionHash', function (hash) {
                            setTransaction(hash);
                        })
                        .on('confirmation', function (confirmationNumber, receipt) {
                            if (confirmationNumber === constants.transactionLimit) {
                                console.log(receipt);
                                marketplace.methods.makeSkinsListing(item.tokenId, quantity, web3.utils.toWei(String(price), "ether")).send({
                                    from: account.address
                                })
                                    .on('transactionHash', function (hash) {
                                        setTransaction(hash);
                                    })
                                    .on('confirmation', function (confirmationNumber, receipt) {
                                        window.location.reload();
                                    })
                                    .on('receipt', function (receipt) {
                                        // receipt example
                                        console.log(receipt);
                                    })
                                    .on('error', function (error, receipt) {
                                        setHasError(true);
                                        setLoading(null);
                                        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                                    });
                            }
                        })
                        .on('receipt', function (receipt) {
                            // receipt example
                            console.log(receipt);
                        })
                        .on('error', function (error, receipt) {
                            setHasError(true);
                            setLoading(null);
                            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                        });
                } catch (e) {
                    setLoading(null);
                    console.log(e);
                }
            } else {
                setLoading(null);
            }
        } else {
            setLoading(null);
        }
    }
    const buyMainNow = async () => {
        if (account) {
            try {
                setLoading('buying');
                const _price = Number(listing.price) * Number(listing.amount) + 100000000000000000;
                console.log(_price);
                coin.methods.increaseAllowance(marketplace.options.address, _price.toString()).send({
                    from: account.address
                })
                    .on('transactionHash', function (hash) {
                        setTransaction(hash);
                    })
                    .on('confirmation', function (confirmationNumber, receipt) {
                        if (confirmationNumber === constants.transactionLimit) {
                            console.log(receipt);
                            marketplace.methods.fulfillSkinsListing(Number(listing.listingId)).send({
                                from: account.address
                            })
                                .on('transactionHash', function (hash) {
                                    setTransaction(hash);
                                })
                                .on('confirmation', function (confirmationNumber, receipt) {
                                    window.location.reload();
                                })
                                .on('receipt', function (receipt) {
                                    // receipt example
                                    console.log(receipt);
                                })
                                .on('error', function (error, receipt) {
                                    setLoading(null);
                                    setHasError(true);
                                    // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                                });
                        }
                    })
                    .on('receipt', function (receipt) {
                        // receipt example
                        console.log(receipt);
                    })
                    .on('error', function (error, receipt) {
                        setLoading(null);
                        setHasError(true);
                        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    });
            } catch (e) {
                setLoading(null);
                console.log(e);
            }
        } else {
            console.log('Wallet not connected');
        }
    }
    const buyNow = async (_listing) => {
        if (account) {
            try {
                setLoading('buying');
                const _price = Number(listing.price) * Number(listing.amount) + 100000000000000000;
                console.log(_price);
                coin.methods.increaseAllowance(marketplace.options.address, _price.toString()).send({
                    from: account.address
                })
                    .on('transactionHash', function (hash) {
                        setTransaction(hash);
                    })
                    .on('confirmation', function (confirmationNumber, receipt) {
                        if (confirmationNumber === constants.transactionLimit) {
                            console.log(receipt);
                            marketplace.methods.fulfillSkinsListing(Number(_listing.listingId)).send({
                                from: account.address
                            })
                                .on('transactionHash', function (hash) {
                                    setTransaction(hash);
                                })
                                .on('confirmation', function (confirmationNumber, receipt) {
                                    window.location.reload();
                                })
                                .on('receipt', function (receipt) {
                                    // receipt example
                                    console.log(receipt);
                                })
                                .on('error', function (error, receipt) {
                                    setLoading(null);
                                    setHasError(true);
                                    // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                                });
                        }
                    })
                    .on('receipt', function (receipt) {
                        // receipt example
                        console.log(receipt);
                    })
                    .on('error', function (error, receipt) {
                        setLoading(null);
                        setHasError(true);
                        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    });
            } catch (e) {
                setLoading(null);
                console.log(e);
            }
        } else {
            console.log('Wallet not connected');
        }
    }
    const cancelListing = async (_listingId) => {
        if (account) {
            try {
                setLoading('cancelListing');
                marketplace.methods.cancelSkinsListing(Number(_listingId)).send({
                    from: account.address
                })
                    .on('transactionHash', function (hash) {
                        setTransaction(hash);
                    })
                    .on('confirmation', function (confirmationNumber, receipt) {
                        window.location.reload();
                    })
                    .on('receipt', function (receipt) {
                        // receipt example
                        console.log(receipt);
                    })
                    .on('error', function (error, receipt) {
                        setLoading(null);
                        setHasError(true);
                        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    });
                // console.log(response);
            } catch (e) {
                setLoading(null);
                console.log(e);
            }
        } else {
            console.log('Wallet not connected');
        }
    }

    return (
        <section>
            <Container>
                {
                    loading === 'items' ?
                        <div className="text-center w-100 py-5 mt-5">
                            <Spinner color="white"/>
                        </div> :
                        <>
                            <Row className="mb-4">
                                <Col lg={5} md={6}>
                                    <div className="mb-4">
                                        <img
                                            src={item.image}
                                            alt=""
                                            className="w-100 img-fluid single__nft-img"
                                        />
                                    </div>
                                    <UncontrolledAccordion defaultOpen="2">
                                        <AccordionItem>
                                            <AccordionHeader targetId="1">
                                                <i className="fas fa-align-left me-2"/> <strong>Description</strong>
                                            </AccordionHeader>
                                            <AccordionBody accordionId="1">
                                                <div className="accordion-body-padding">
                                                    <p className="nft-description">{item.description}</p>
                                                </div>
                                            </AccordionBody>
                                        </AccordionItem>
                                        <AccordionItem>
                                            <AccordionHeader targetId="2">
                                                <i className="fas fa-tags me-2"/> <strong>Properties</strong>
                                            </AccordionHeader>
                                            <AccordionBody accordionId="2">
                                                <div className="accordion-body-padding">
                                                    <Row>
                                                        {
                                                            item.attributes.length > 0 ?
                                                                item.attributes.map(_attribute => (
                                                                    <Col md={4}>
                                                                        <div className="property-card">
                                                                            <p className="property-name">{_.startCase(_attribute.trait_type)}</p>
                                                                            <p className="property-value">{_.startCase(_attribute.value)}</p>
                                                                        </div>
                                                                    </Col>
                                                                )) :
                                                                <Col className="text-center text-white-50">
                                                                    No properties defined
                                                                </Col>
                                                        }
                                                    </Row>
                                                </div>
                                            </AccordionBody>
                                        </AccordionItem>
                                    </UncontrolledAccordion>
                                </Col>

                                <Col lg={7} md={6}>
                                    <div className="mb-4">
                                        <div className="d-md-flex justify-content-between align-items-start">
                                            <div>
                                                <h2 className="">{item.name}</h2>
                                                <div
                                                    className="d-flex justify-content-start align-items-baseline text-muted">
                                                    <p className="me-4">
                                                        <i className="fas fa-user-friends me-1"/> {Object.values(item.owners).filter(_item => _item > 0).length} owners
                                                    </p>
                                                    <p className="me-4">
                                                        <i className="fas fa-th me-1"/> {Object.values(item.owners).reduce((partialSum, a) => partialSum + a, 0)} total
                                                    </p>
                                                    <p>
                                                        {loading === "favourites" ?
                                                            <div
                                                                className=" spinner-border-sm spinner-border text-secondary p-1 mx-1"
                                                                role="status">
                                                                <span className="sr-only">Loading...</span>
                                                            </div> :
                                                            user ? <>
                                                                {user.favourites.includes(item.id) ?
                                                                    <i className="fas fa-heart me-2" role="button"
                                                                       onClick={addFav}/> :
                                                                    <i className="far fa-heart me-2" role="button"
                                                                       onClick={addFav}/>}
                                                            </> : <i className="far fa-heart me-2" role="button"/>}
                                                        {item.favourites || 0} favourites </p>
                                                </div>
                                            </div>
                                            <div>
                                                <ButtonGroup>
                                                    <Button
                                                        color="light"
                                                        outline
                                                        id="refreshMetadata"
                                                    >
                                                        <i className="fas fa-redo-alt"/>
                                                    </Button>
                                                    <UncontrolledTooltip
                                                        placement="top"
                                                        target="refreshMetadata"
                                                    >
                                                        Refresh Metadata
                                                    </UncontrolledTooltip>
                                                    {
                                                        account && (
                                                            item.owners[account.address] > 0 &&
                                                            <>
                                                                <Button
                                                                    color="light"
                                                                    outline
                                                                    id="transfer"
                                                                >
                                                                    <i className="fas fa-paper-plane"/>
                                                                </Button>
                                                                <UncontrolledTooltip
                                                                    placement="top"
                                                                    target="transfer"
                                                                >
                                                                    Transfer
                                                                </UncontrolledTooltip>
                                                            </>
                                                        )
                                                    }
                                                    {/*<Button*/}
                                                    {/*    color="light"*/}
                                                    {/*    outline*/}

                                                    {/*>*/}
                                                    {/*    <i className="fas fa-external-link-alt"/>*/}
                                                    {/*</Button>*/}
                                                    <Button
                                                        color="light"
                                                        outline
                                                        id="share"
                                                    >
                                                        <i className="fas fa-share-alt"/>
                                                    </Button>
                                                    <UncontrolledTooltip
                                                        placement="top"
                                                        target="share"
                                                    >
                                                        Share
                                                    </UncontrolledTooltip>
                                                    {/*<UncontrolledButtonDropdown*/}
                                                    {/*>*/}
                                                    {/*    <DropdownToggle caret*/}
                                                    {/*                    color="light"*/}
                                                    {/*                    outline*/}
                                                    {/*    />*/}
                                                    {/*    <DropdownMenu>*/}
                                                    {/*        <DropdownItem header>*/}
                                                    {/*            Header*/}
                                                    {/*        </DropdownItem>*/}
                                                    {/*        <DropdownItem disabled>*/}
                                                    {/*            Action*/}
                                                    {/*        </DropdownItem>*/}
                                                    {/*        <DropdownItem>*/}
                                                    {/*            Another Action*/}
                                                    {/*        </DropdownItem>*/}
                                                    {/*        <DropdownItem divider/>*/}
                                                    {/*        <DropdownItem>*/}
                                                    {/*            Another Action*/}
                                                    {/*        </DropdownItem>*/}
                                                    {/*    </DropdownMenu>*/}
                                                    {/*</UncontrolledButtonDropdown>*/}
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                    </div>

                                    {
                                        listing &&
                                        <div className="rounded bg-dark p-3 border-dark mb-4">
                                            <div>
                                                <p className="text-muted mb-1 font-monospace">Best price</p>
                                                <div className="d-flex justify-content-start align-items-baseline">
                                                    <h3 className="text-white me-2"><i
                                                        className="fab fa-ethereum me-1"/> {web3.utils.fromWei(listing.price)}
                                                    </h3>
                                                    <h5 className="text-muted fw-light">per skin,
                                                        for {listing.amount} skins</h5>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                {
                                                    account ?
                                                        (
                                                            listing.user_lowerCase !== account.address &&
                                                            <Button className="px-5 me-2" color="primary" size="lg"
                                                                    disabled={loading === 'buying'}
                                                                    onClick={buyMainNow}>
                                                                <i className="fas fa-shopping-bag me-2"/> Buy Now
                                                            </Button>
                                                        ) :
                                                        <Link className="px-5 btn btn-lg btn-primary me-2"
                                                              to={`/wallet?redirectTo=/assets/${id}`}>
                                                            <i className="fas fa-shopping-bag me-2"/> Buy Now
                                                        </Link>
                                                }
                                                {
                                                    account ?
                                                        <Button className="px-5" color="light" size="lg"
                                                                disabled={loading === 'offering' || loading === 'selling'}
                                                                onClick={makeOffer}>
                                                            {
                                                                loading === 'offering' ?
                                                                    <Spinner color="dark"/> :
                                                                    <><i className="fas fa-tag me-2"/> Make Offer</>
                                                            }
                                                        </Button> :
                                                        <Link className="px-5 btn btn-lg btn-light"
                                                              to={`/wallet?redirectTo=/assets/${item.type}/${id}`}>
                                                            <i className="fas fa-tag me-2"/> Make Offer
                                                        </Link>
                                                }
                                                {
                                                    transaction &&
                                                    <a className="px-5 ms-2 btn btn-lg btn-outline-primary"
                                                       target="_blank"
                                                       href={`https://rinkeby.etherscan.io/tx/${transaction}`}>
                                                        View Transaction
                                                    </a>
                                                }
                                            </div>
                                            {
                                                hasError &&
                                                <Alert
                                                    className="mt-3"
                                                    color="danger"
                                                >
                                                    Something went wrong. <a target="_blank"
                                                                             href={`https://rinkeby.etherscan.io/tx/${transaction}`}>View</a> transaction
                                                    for more details.
                                                </Alert>
                                            }
                                        </div>
                                    }
                                    <div>
                                        <div className="mb-3">
                                            {
                                                !listing && (
                                                    <div>
                                                        {
                                                            (account && (item.owners[account.address] > 0)) &&
                                                            <Button className="px-5 me-2" color="primary" size="lg"
                                                                    disabled={loading === 'selling'}
                                                                    onClick={sell}>
                                                                {
                                                                    loading === 'selling' ?
                                                                        <Spinner color="white"/> :
                                                                        <><i className="fas fa-wallet me-2"/> Sell</>
                                                                }
                                                            </Button>
                                                        }
                                                        {
                                                            account ?
                                                                <Button className="px-4" color="light" size="lg"
                                                                        disabled={loading === 'offering' || loading === 'selling'}
                                                                        onClick={makeOffer}>
                                                                    {
                                                                        loading === 'offering' ?
                                                                            <Spinner color="dark"/> :
                                                                            <><i className="fas fa-tag me-2"/> Make
                                                                                Offer</>
                                                                    }
                                                                </Button> :
                                                                <Link className="px-5 me-2 btn btn-lg btn-light"
                                                                      to={`/wallet?redirectTo=/assets/${item.type}/${id}`}>
                                                                    <i className="fas fa-tag me-2"/> Make Offer
                                                                </Link>
                                                        }
                                                        {
                                                            hasError &&
                                                            <Alert
                                                                className="mt-3"
                                                                color="danger"
                                                            >
                                                                Something went wrong. <a target="_blank"
                                                                                         href={`https://rinkeby.etherscan.io/tx/${transaction}`}>View</a> transaction
                                                                for more details.
                                                            </Alert>
                                                        }
                                                        {
                                                            transaction &&
                                                            <a className="px-5 ms-2 btn btn-lg btn-outline-primary"
                                                               target="_blank"
                                                               href={`https://rinkeby.etherscan.io/tx/${transaction}`}>
                                                                View Transaction
                                                            </a>
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    <UncontrolledAccordion defaultOpen="item-activity">
                                        <AccordionItem>
                                            <AccordionHeader targetId="item-activity">
                                                <i className="fas fa-tag me-2"/> <strong>Listings</strong>
                                            </AccordionHeader>
                                            <AccordionBody accordionId="item-activity">
                                                {
                                                    listings.length > 0 ?
                                                        <Table
                                                            borderless
                                                            responsive
                                                            dark
                                                            striped
                                                            className="m-0"
                                                        >
                                                            <thead>
                                                            <tr>
                                                                <th>Price</th>
                                                                <th>Date</th>
                                                                <th>From</th>
                                                                <th/>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {
                                                                listings.map(_listing => (
                                                                    <tr>
                                                                        <td>
                                                                            {
                                                                                _listing.price &&
                                                                                <>
                                                                                    <i className="fab fa-ethereum me-2"/>
                                                                                    {web3.utils.fromWei(_listing.price)}
                                                                                </>
                                                                            }
                                                                        </td>
                                                                        <td>{moment(_listing.createdAt).fromNow()}</td>
                                                                        <td><Link className="text-decoration-none"
                                                                                  to={"#"}>{substringAddress(_listing.user_lowerCase, account ? account.address : "")}</Link>
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                (account &&
                                                                                    (_listing.user_lowerCase !== account.address) &&
                                                                                    (!_listing.fulfilled && !_listing.cancelled)
                                                                                ) &&
                                                                                <Button className="me-2" color="primary"
                                                                                        size="sm"
                                                                                        disabled={loading === 'buying'}
                                                                                        onClick={() => buyNow(_listing)}>
                                                                                    Buy Now
                                                                                </Button>
                                                                            }
                                                                            {
                                                                                (account &&
                                                                                    (_listing.user_lowerCase === account.address) &&
                                                                                    (!_listing.fulfilled && !_listing.cancelled)
                                                                                ) &&
                                                                                <Button color="danger" size="sm"
                                                                                        disabled={loading === 'cancelListing'}
                                                                                        onClick={() => cancelListing(_listing.listingId)}>
                                                                                    Cancel
                                                                                </Button>
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                            </tbody>
                                                        </Table> :
                                                        <Row>
                                                            <Col
                                                                className="accordion-body-padding text-center text-white-50">
                                                                No listings yet
                                                            </Col>
                                                        </Row>
                                                }
                                            </AccordionBody>
                                        </AccordionItem>
                                    </UncontrolledAccordion>
                                    <UncontrolledAccordion defaultOpen="item-activity" className="my-3">
                                        <AccordionItem>
                                            <AccordionHeader targetId="item-activity">
                                                <i className="fas fa-list-ul me-2"/> <strong>Offers</strong>
                                            </AccordionHeader>
                                            <AccordionBody accordionId="item-activity">
                                                {
                                                    offers.length > 0 ?
                                                        <Table
                                                            borderless
                                                            responsive
                                                            dark
                                                            striped
                                                            className="m-0"
                                                        >
                                                            <thead>
                                                            <tr>
                                                                <th>Unit Price</th>
                                                                <th>Amount</th>
                                                                <th>Date</th>
                                                                <th>From</th>
                                                                <th>Expiry</th>
                                                                <th>Status</th>
                                                                <th/>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {
                                                                offers.map(_offer => (
                                                                    <tr>
                                                                        <td>
                                                                            {
                                                                                _offer.price &&
                                                                                <>
                                                                                    <i className="fab fa-ethereum me-2"/>
                                                                                    {web3.utils.fromWei(_offer.price.toString())}
                                                                                </>
                                                                            }
                                                                        </td>
                                                                        <td>{_offer.amount}</td>
                                                                        <td>{moment(_offer.createdAt).fromNow()}</td>
                                                                        <td>
                                                                            <Link className="text-decoration-none"
                                                                                  to={"#"}>
                                                                                {substringAddress(_offer.user_lowerCase, account ? account.address : "")}
                                                                            </Link>
                                                                        </td>
                                                                        <td>
                                                                            {moment(_offer.expiry).fromNow()}
                                                                        </td>
                                                                        <td>
                                                                            {_offer.expiry > Date.now() && !_offer.cancelled && !_offer.fulfilled ?
                                                                                <Badge
                                                                                    color="primary"
                                                                                    pill
                                                                                >
                                                                                    Active
                                                                                </Badge> : <Badge
                                                                                    color="danger"
                                                                                    pill
                                                                                >
                                                                                    In Active
                                                                                </Badge>}

                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                (account &&
                                                                                    (_offer.user_lowerCase !== account.address) &&
                                                                                    (item.owners[account.address] >= Number(_offer.amount)) &&
                                                                                    (!_offer.fulfilled && !_offer.cancelled) &&
                                                                                    (_offer.expiry > Date.now())
                                                                                ) &&
                                                                                <Button className="me-2" color="primary"
                                                                                        size="sm"
                                                                                        disabled={loading === 'acceptingOffer'}
                                                                                        onClick={() => acceptOffer(_offer.offerId)}>
                                                                                    Accept
                                                                                </Button>
                                                                            }
                                                                            {
                                                                                (account &&
                                                                                    (_offer.user_lowerCase === account.address) &&
                                                                                    (!_offer.fulfilled && !_offer.cancelled) &&
                                                                                    (_offer.expiry > Date.now())
                                                                                ) &&
                                                                                <Button color="danger" size="sm"
                                                                                        disabled={loading === 'cancelOffer'}
                                                                                        onClick={() => cancelOffer(_offer.offerId)}>
                                                                                    Cancel
                                                                                </Button>
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                            </tbody>
                                                        </Table> :
                                                        <Row>
                                                            <Col
                                                                className="accordion-body-padding text-center text-white-50">
                                                                No offers yet
                                                            </Col>
                                                        </Row>
                                                }
                                            </AccordionBody>
                                        </AccordionItem>
                                    </UncontrolledAccordion>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div>
                                        <UncontrolledAccordion defaultOpen="item-activity">
                                            <AccordionItem>
                                                <AccordionHeader targetId="item-activity">
                                                    <i className="fas fa-history me-2"/> <strong>Item Activity</strong>
                                                </AccordionHeader>
                                                <AccordionBody accordionId="item-activity">
                                                    <Table
                                                        borderless
                                                        responsive
                                                        dark
                                                        striped
                                                        className="m-0"
                                                    >
                                                        <thead>
                                                        <tr>
                                                            <th>Event</th>
                                                            <th>Price</th>
                                                            <th>Amount</th>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th>Date</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            activity.map(_activity => (
                                                                <tr>
                                                                    <td>{prettifyEvent(_activity.event)}</td>
                                                                    <td>
                                                                        {
                                                                            _activity.price &&
                                                                            <>
                                                                                <i className="fab fa-ethereum me-2"/>
                                                                                {web3.utils.fromWei(_activity.price + "")}
                                                                            </>
                                                                        }
                                                                    </td>
                                                                    <td>{_activity.amount}</td>
                                                                    <td><Link className="text-decoration-none"
                                                                              to={"#"}>{substringAddress(_activity.from, account ? account.address : "")}</Link>
                                                                    </td>
                                                                    <td><Link className="text-decoration-none"
                                                                              to={"#"}>{substringAddress(_activity.to, account ? account.address : "")}</Link>
                                                                    </td>
                                                                    <td>{moment(_activity.timestamp).fromNow()}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                        </tbody>
                                                    </Table>
                                                </AccordionBody>
                                            </AccordionItem>
                                        </UncontrolledAccordion>
                                    </div>
                                </Col>
                            </Row>
                        </>
                }
            </Container>
        </section>
    );
};

export default SkinDetails;
