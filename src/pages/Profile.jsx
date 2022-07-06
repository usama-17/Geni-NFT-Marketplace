import React from "react";
import {Link, useSearchParams} from "react-router-dom";
import MyCollection from "./MyCollection";
import Favourite from "./Favourite";
import OffersReceived from "./Offers-Received";
import ListingActive from "./Listing-Active";
import ListingInactive from "./Listing-Inactive";
import OffersMade from "./Offers-Made";

const Profile = (props) => {
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab");
    // const [transaction, setTransaction] = useState("");
    // const [hasError, setHasError] = useState(false);
    //
    // const claimMyFunds = async () => {
    //     Swal.fire({
    //         title: 'Are you sure?',
    //         text: "You won't be able to revert this!",
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Withdraw Funds!'
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             await props.marketplace.methods.claimFunds().send(
    //                 {from: props.account.address}
    //             ).on('transactionHash', function (hash) {
    //                 setTransaction(hash);
    //             })
    //                 .on('confirmation', function () {
    //                     Swal.fire({
    //                         title: 'Claimed!',
    //                         text: 'Funds Added into Wallet.',
    //                         icon: 'success',
    //                         showConfirmButton: false,
    //                         timer: 4000
    //                     })
    //                 })
    //                 .on('error', function (error, receipt) {
    //                     setHasError(true);
    //                 });
    //         }
    //     })
    // }
    return (
        <section style={{marginBottom: "100px"}}>
            <div className="d-flex justify-content-center" style={{marginTop: "100px"}}>
                <div>
                    <div>
                        <img src="/ava-01.png" className="w-100" height="150px" alt="profile"/>
                    </div>
                    <div>
                        <h2 style={{color:"green"}}>Unnamed</h2>
                        {props.address &&
                    <div className="rounded-pill" style={{backgroundColor: "rgb(100,48,110)"}}>
                        <i className="fab fa-ethereum p-2 px-1"/><span
                        className="px-1  p-2 rounded-pill text-center text-white">{props.address.substring(0, 5) + '....' + props.address.substring(props.address.length - 6, props.address.length)}</span>
                    </div>}

                    </div>
                </div>
            </div>
            {/*<div className="container w-50">*/}
            {/*{*/}
            {/*    hasError &&*/}
            {/*    <Alert*/}
            {/*        className="mt-3"*/}
            {/*        color="danger"*/}
            {/*    >*/}
            {/*        Something went wrong. <a target="_blank"*/}
            {/*                                 href={`https://rinkeby.etherscan.io/tx/${transaction}`}>View</a> transaction*/}
            {/*        for more details.*/}
            {/*    </Alert>*/}
            {/*}*/}
            {/*</div>*/}
            <div className="container mt-4">
                <div className="text-white  single__nft__card text-center rounded-pill p-2 row">
                    <ul className="nav">
                        <li className="nav-item col">
                            <Link to="/profile"
                                  className={`text-decoration-none nav-link ${!tab ? "active1" : "nonactive1"}`}><i
                                className="ri-task-line p-2"/>Collected</Link>
                        </li>
                        <li className="nav-item col">
                            <Link to="/profile?tab=favourite"
                                  className={`text-decoration-none nav-link ${tab === "favourite" ? "active1" : "nonactive1"}`}>
                                <i className="far fa-heart me-2"/>Favourited
                            </Link>
                        </li>
                        <li className="nav-item dropdown col">
                            <a className={`text-decoration-none nav-link dropdown-toggle   ${tab === "offersReceived" || tab === "offersMade" ? "active1 show" : "nonactive1"}`}
                               data-bs-toggle="dropdown" role="button"
                               aria-expanded="false"><i className="fas fa-list-ul me-2"/>Offers</a>
                            <ul className="dropdown-menu rounded border border-success">
                                <li>
                                    <Link to="/profile?tab=offersReceived" className="dropdown-item"><i
                                        className="ri-arrow-left-down-line ri-lg p-1 "/>Offers Received</Link></li>
                                <li><Link to="/profile?tab=offersMade" className="dropdown-item"><i
                                    style={{paddingTop: "20px",}}
                                    className="ri-arrow-right-up-line ri-lg p-1 "/>Offers made</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown col">
                            <a className={`text-decoration-none nav-link dropdown-toggle   ${tab === "listingActive" || tab === "listingInactive" ? "active1 show" : "nonactive1"}`}
                               data-bs-toggle="dropdown" role="button"
                               aria-expanded="false"><i className="fas fa-tag me-2"/>Listing</a>
                            <ul className="dropdown-menu  rounded border border-success">
                                <li className="d-flex justify-content-center">
                                    <Link to="/profile?tab=listingActive"
                                          className="dropdown-item d-flex justify-content-center"><i
                                        className="ri-checkbox-circle-line ri-lg p-1"/>Active</Link></li>
                                <li><Link to="/profile?tab=listingInactive"
                                          className="dropdown-item  d-flex justify-content-center"><i
                                    className="ri-error-warning-line ri-lg p-1"/>Inactive</Link></li>
                            </ul>
                        </li>
                        {/*<li className="nav-item col text-white" role="button" onClick={claimMyFunds}>*/}
                        {/*    <a*/}
                        {/*        className="text-decoration-none nav-link"><i*/}
                        {/*        className="ri-coins-fill p-2"/>Claim Funds</a>*/}
                        {/*</li>*/}
                    </ul>
                </div>
            </div>
            <div className="container-fluid">
                {!tab && <MyCollection {...props}/>}
                {tab === "favourite" && <Favourite {...props}/>}
                {tab === "offersReceived" && <OffersReceived {...props}/>}
                {tab === "offersMade" && <OffersMade {...props}/>}
                {tab === "listingActive" && <ListingActive {...props}/>}
                {tab === "listingInactive" && <ListingInactive {...props}/>}
            </div>
        </section>
    )
}
export default Profile;
