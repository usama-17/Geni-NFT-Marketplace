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

const CharacterDetails = ({account, web3, characters, coin, marketplace}) => {
    const [item, setItem] = useState({});
    const [listing, setListing] = useState({});
    const [listings, setListings] = useState([]);
    const [offer, setOffer] = useState({});
    const [offers, setOffers] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState("items");
    const [user, setUser] = useState({});
    const [transaction, setTransaction] = useState(null);
    const [hasError, setHasError] = useState(false);

    const {id} = useParams();
    const navigate = useNavigate();

    const nftsRef = collection(db, constants.dbNfts);
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
        let items = [], currentOffer = {};
        querySnapshot.docs.forEach(_doc => {
            let _data = _doc.data();
            if (!_data.fulfilled && !_data.cancelled && _data.user_lowerCase === account.address) {
                currentOffer = _data;
            }
            items.push(_data);
        });
        console.log(currentOffer);
        return {currentOffer: currentOffer, offers: items};
    }
    const loadListings = async _nft => {
        const q = query(
            listingRef,
            where("tokenId", "==", _nft.tokenId),
            where("collection", "==", _nft.collection),
            orderBy("createdAt", "desc")
        );
        console.log(_nft);
        const querySnapshot = await getDocs(q);
        let items = [], currentListing = {};
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
            showCancelButton: true,
            html:
                '  <div class="mb-3">\n' +
                '    <label for="price" class="form-label">Price</label>\n' +
                '    <input type="number" class="form-control" id="price">\n' +
                '  </div>\n' +
                '  <div class="mb-3">\n' +
                '    <label for="expiry" class="form-label">Expiry</label>\n' +
                '   <div>\n' +
                '    <select class="form-select" id="expiry" aria-label="Default select example">\n' +
                '    <option selected>Expiry</option>\n' +
                '    <option value="6Hours">6 Hours</option>\n' +
                '    <option value="12Hours">12 Hours</option>\n' +
                '    <option value="1Day">1 Day</option>\n' +
                '    <option value="7Days">7 Days</option>\n' +
                '    </select>\n' +
                '    </div>\n' +
                '  </div>\n',
            preConfirm: () => {
                return [
                    document.getElementById('price').value,
                    document.getElementById('expiry').value,
                ]
            }
        });
        setLoading(null);
        // console.log(formValues);
        const price = formValues[0];
        let expiry = formValues[1];
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
        console.log(price);
        console.log(expiry);
        console.log(account.address);
        if (price > 0) {
            try {
                setLoading("offering");
                const _price = Number(price) + 100000000000000000;
                console.log(_price);
                await coin.methods.increaseAllowance(marketplace.options.address, web3.utils.toWei(String(_price), "ether")).send({
                    from: account.address
                });
                marketplace.methods.makeCharacterOffer(item.tokenId, web3.utils.toWei(String(price), "ether"), expiry).send({
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
            } catch (e) {
                setLoading(null);
                console.log(e);
            }
        } else {
            setLoading(null);
        }
    }
    const acceptOffer = async (_offerId, _tokenId) => {
        console.log(_offerId);
        console.log();
        if (account) {
            try {
                setLoading("acceptOffer");
                characters.methods.approve(marketplace.options.address, _tokenId).send({
                    from: account.address
                })
                marketplace.methods.fulfillCharacterOffer(Number(_offerId)).send({
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
            } catch (e) {
                console.log(e)
            }
        } else {
            console.log("Wallet not connected");
        }
    }
    const cancelOffer = async () => {
        if (account) {
            try {
                setLoading('cancelOffer');
                marketplace.methods.cancelCharacterOffer(Number(offer.offerId)).send({
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
        const {value: priceInEther} = await Swal.fire({
            title: 'Enter price',
            input: 'number',
            inputLabel: 'in Ether',
            inputValue: '',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Price is required!'
                } else if (parseFloat(value) <= 0) {
                    return 'Price must be greater than 0.'
                }
            }
        });

        const price = parseFloat(priceInEther);
        if (price > 0) {
            try {
                await characters.methods.setApprovalForAll(marketplace.options.address, true).send({from: account.address});
                marketplace.methods.makeCharacterListing(item.tokenId, web3.utils.toWei(String(price), "ether")).send({
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
            } catch (e) {
                setLoading(null);
                console.log(e);
            }
        } else {
            setLoading(null);
        }
    }

    const buyNow = async () => {
        if (account) {
            try {
                setLoading('buying');
                const _price = Number(listing.price) + 100000000000000000;
                console.log(_price);
                await coin.methods.increaseAllowance(marketplace.options.address, _price.toString()).send({
                    from: account.address
                });
                marketplace.methods.fulfillCharactersListing(Number(listing.listingId)).send({
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
    const cancelListing = async () => {
        if (account) {
            try {
                setLoading('cancelListing');
                marketplace.methods.cancelCharacterListing(Number(listing.listingId)).send({
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
                                    <UncontrolledAccordion defaultOpen="1">
                                        <AccordionItem>
                                            <AccordionHeader targetId="1">
                                                <i className="fas fa-align-left me-2"/> <strong>Description</strong>
                                            </AccordionHeader>
                                            <AccordionBody accordionId="1">
                                                <div className="accordion-body-padding">
                                                    <p className=" text-dark nft-description">{item.description}</p>
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
                                                                <Col className="text-center text-dark">
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
                                    <div className="">
                                        <div className="d-md-flex justify-content-between align-items-start">
                                            <div>
                                                <h2 className="text-dark">{item.name}</h2>
                                                <div
                                                    className="d-flex justify-content-start align-items-baseline text-muted">
                                                    <p className="me-4 text-black">
                                                        Owned by
                                                        <Link to={`#`} className="ms-2 text-decoration-none">
                                                            {
                                                                account ? (item.owner_lowerCase === account.address ?
                                                                        'you' :
                                                                        listing.listingId ?
                                                                            substringAddress(listing.user_lowerCase) : substringAddress(item.owner_lowerCase)
                                                                    ) :
                                                                    substringAddress(item.owner_lowerCase)
                                                            }
                                                        </Link>
                                                    </p>
                                                    <p className="text-dark">
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
                                                            item.owner_lowerCase === account.address &&
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
                                        listing.listingId ?
                                            <div className="rounded p-3 border-dark mb-4">
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1 font-monospace">Current price</p>
                                                    <div className="d-flex justify-content-start align-items-baseline">
                                                        <h3 className=" me-3"><i
                                                            className="fab fa-ethereum me-1"/> {web3.utils.fromWei(listing.price)}
                                                        </h3>
                                                        <h5 className="text-muted fw-light">(${`${web3.utils.fromWei(listing.price) * 4000}`})</h5>
                                                    </div>
                                                </div>
                                                {
                                                    account ? (
                                                            account.address === listing.user_lowerCase ?
                                                                <Button className="px-5" color="danger" size="lg"
                                                                        onClick={cancelListing}>
                                                                    {loading === 'cancelListing' ?
                                                                        <Spinner color="white"/> : <>
                                                                            <i className="fas fa-ban me-2"/> Cancel</>}
                                                                </Button> : (
                                                                    <>
                                                                        <Button className="px-5" color="primary" size="lg"
                                                                                disabled={loading === 'buying'}
                                                                                onClick={buyNow}>
                                                                            {
                                                                                loading === 'buying' ?
                                                                                    <Spinner color="white"/> :
                                                                                    <><i
                                                                                        className="fas fa-shopping-bag me-2"/> Buy
                                                                                        Now</>
                                                                            }
                                                                        </Button>
                                                                        {/*{*/}
                                                                        {/*    account.address === offer.user_lowerCase ? ""*/}
                                                                        {/*        <Button className="px-5 mx-2"*/}
                                                                        {/*                color="danger"*/}
                                                                        {/*                size="lg"*/}
                                                                        {/*                onClick={cancelOffer}>*/}
                                                                        {/*            {loading === 'cancelOffer' ?*/}
                                                                        {/*                <Spinner color="white"/> : <>*/}
                                                                        {/*                    <i className="fas fa-ban me-2"/> Cancel</>}*/}
                                                                        {/*        </Button>*/}
                                                                        {/*        :*/}
                                                                        <Button className="px-5 mx-2 my-3"
                                                                                color="light" size="lg"
                                                                                disabled={loading === 'offering'}
                                                                                onClick={makeOffer}
                                                                        >
                                                                            {
                                                                                loading === 'offering' ?
                                                                                    <Spinner color="white"/> :
                                                                                    <><i
                                                                                        className="fas fa-tag me-2"/> Make
                                                                                                Offer</>
                                                                                    }
                                                                                </Button>
                                                                        {/*}*/}
                                                                    </>
                                                                )
                                                        ) :
                                                        <>
                                                            <Link className="px-5 btn btn-lg btn-primary"
                                                                  to={`/wallet?redirectTo=/assets/${id}`}>
                                                                <i className="fas fa-shopping-bag me-2"/> Buy Now
                                                            </Link>
                                                            <Link className="px-5 mx-2 btn btn-lg btn-light"
                                                                  to={`/wallet?redirectTo=/assets/${item.type}/${id}`}>
                                                                <i className="fas fa-tag me-2"/> Make Offer
                                                            </Link>
                                                        </>
                                                }
                                                {
                                                    transaction &&
                                                    <a className="px-5 ms-2 btn btn-lg btn-outline-success"
                                                       target="_blank"
                                                       href={`https://rinkeby.etherscan.io/tx/${transaction}`}>
                                                        View Transaction
                                                    </a>
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
                                            </div> : (
                                                (account && (item.owner_lowerCase === account.address.toLowerCase())) &&
                                                <div className="mb-3">
                                                    <Button className="px-5" color="success" size="lg"
                                                            disabled={loading === 'selling'}
                                                            onClick={sell}>
                                                        {
                                                            loading === 'selling' ?
                                                                <Spinner color="white"/> :
                                                                'Sell'
                                                        }
                                                    </Button>
                                                    {
                                                        transaction &&
                                                        <a className="px-5 ms-2 btn btn-lg btn-outline-primary"
                                                           target="_blank"
                                                           href={`https://rinkeby.etherscan.io/tx/${transaction}`}>
                                                            View Transaction
                                                        </a>
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
                                                </div>
                                            )
                                    }
                                    {
                                        account ? (
                                                <>
                                                    {
                                                        account.address.toLowerCase() !== listing.user_lowerCase && account.address !== item.owner_lowerCase && !listing.listingId &&
                                                        <>
                                                            {/*{*/}
                                                            {/*    account.address === offer.user_lowerCase ?*/}
                                                            {/*        <Button className="px-5 mx-2 my-3"*/}
                                                            {/*                color="danger"*/}
                                                            {/*                size="lg"*/}
                                                            {/*                onClick={cancelOffer}>*/}
                                                            {/*            {loading === 'cancelOffer' ?*/}
                                                            {/*                <Spinner color="white"/> : <>*/}
                                                            {/*                    <i className="fas fa-ban me-2"/> Cancel</>}*/}
                                                            {/*        </Button> */}
                                                            {/*        :*/}
                                                            <Button className="px-5 mx-2 my-3"
                                                                    color="success" size="lg"
                                                                    disabled={loading === 'offering'}
                                                                    onClick={makeOffer}
                                                            >
                                                                {
                                                                    loading === 'offering' ?
                                                                        <Spinner color="white"/> :
                                                                        <><i
                                                                            className="fas fa-tag me-2"/> Make
                                                                                    Offer</>
                                                                        }
                                                                    </Button>
                                                            {/*}*/}
                                                        </>
                                                    }
                                                </>
                                            ) :
                                            <>
                                                {!listing.listingId &&
                                                <Link className="px-5 mx-2 btn btn-lg btn-success my-3"
                                                      to={`/wallet?redirectTo=/assets/${item.type}/${id}`}>
                                                    <i className="fas fa-tag me-2"/> Make Offer
                                                </Link>}
                                            </>
                                    }

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
                                                            striped
                                                            className="m-0"
                                                        >
                                                            <thead>
                                                            <tr>
                                                                <th>Price</th>
                                                                <th>Date</th>
                                                                <th>From</th>
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
                                                                                  to={"#"}>{substringAddress(_listing.user)}</Link>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                            </tbody>
                                                        </Table> :
                                                        <Row>
                                                            <Col
                                                                className="accordion-body-padding text-center text-dark">
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
                                                            striped
                                                            className="m-0"
                                                        >
                                                            <thead>
                                                            <tr>
                                                                <th>Price</th>
                                                                <th>Date</th>
                                                                <th>From</th>
                                                                <th>Status</th>
                                                                <th>Expiry</th>
                                                                {account && item.owner_lowerCase === account.address &&
                                                                <th>Action</th>}
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
                                                                        <td>{moment(_offer.createdAt).fromNow()}</td>
                                                                        <td><Link className="text-decoration-none"
                                                                                  to={"#"}>{substringAddress(_offer.user)}</Link>
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
                                                                            {moment(Number(_offer.expiry)).fromNow()}
                                                                        </td>
                                                                        <td>
                                                                            {account && item.owner_lowerCase === account.address && _offer.expiry > Date.now() && !_offer.cancelled && !_offer.fulfilled &&
                                                                            <Button size="sm" outline color="primary"
                                                                                    onClick={() => acceptOffer(_offer.offerId, _offer.tokenId)}>
                                                                                Accept
                                                                            </Button>}
                                                                        </td>

                                                                    </tr>
                                                                ))
                                                            }
                                                            </tbody>
                                                        </Table> :
                                                        <Row>
                                                            <Col
                                                                className="accordion-body-padding text-center text-dark">
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
                                                        striped
                                                        className="m-0"
                                                    >
                                                        <thead>
                                                        <tr>
                                                            <th>Event</th>
                                                            <th>Price</th>
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
                                                                                {web3.utils.fromWei(_activity.price)}
                                                                            </>
                                                                        }
                                                                    </td>
                                                                    <td><Link className="text-decoration-none"
                                                                              to={"#"}>{substringAddress(_activity.from)}</Link>
                                                                    </td>
                                                                    <td><Link className="text-decoration-none"
                                                                              to={"#"}>{substringAddress(_activity.to)}</Link>
                                                                    </td>
                                                                    <td>{moment(_activity.timestamp).isValid() ? moment(_activity.timestamp).fromNow() : moment(_activity.timestamp).fromNow()}</td>
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

export default CharacterDetails;
