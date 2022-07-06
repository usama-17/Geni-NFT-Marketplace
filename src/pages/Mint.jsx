import React, {useEffect, useState} from "react";
import {Spinner} from "reactstrap";
import "../styles/overlay.css"

const Mint = (props) => {
    const [contractState, setContractState] = useState(null);
    const [maxSupply, setMaxSupply] = useState(1000);
    const [price, setPrice] = useState(0.05);
    const [maxPerWallet, setMaxPerWallet] = useState(20);
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [isWhiteListed, setIsWhiteListed] = useState(null);
    const [isOGListed, setIsOGListed] = useState(null);
    useEffect(async () => {
        console.log(props);
        await setValues();
    }, []);
    useEffect(() => {
        const num = count * price;
        setTotal(Math.round(num * 100) / 100);
    }, [count]);
    const setValues = async () => {
        setLoading("loadValues");
        const _contractState = await props.minting.methods.state().call();
        console.log(_contractState);
        setContractState(Number(_contractState));
        const _maxSupply = await props.minting.methods.getMaxSupply().call();
        setMaxSupply(_maxSupply);
        const _maxPerWallet = await props.minting.methods.maxNFTsPerWallet().call();
        setMaxPerWallet(_maxPerWallet);
        if (props.account) {
            const _isWhiteListed = await props.minting.methods.whitelist(props.account.address).call();
            setIsWhiteListed(_isWhiteListed);
            const _isOGListed = await props.minting.methods.OGUser(props.account.address).call();
            setIsOGListed(_isOGListed);
            if (_contractState == 1) {
                if (_isWhiteListed) {
                    const _price = await props.minting.methods.getWhitelistPrice().call();
                    setPrice(props.web3.utils.fromWei(String(_price), "ether"));
                } else if (_isOGListed) {
                    const _price = await props.minting.methods.getOGNftPrice().call();
                    setPrice(props.web3.utils.fromWei(String(_price), "ether"));
                } else return
            } else if (_contractState == 2) {
                const _price = await props.minting.methods.getPublicNftPrice().call();
                setPrice(props.web3.utils.fromWei(String(_price), "ether"));
            } else {
                setLoading(null);
            }
        }
        setLoading(null);
    }
    const plus = () => {
        let _count = count;
        setCount(++_count);
    };
    const minus = () => {
        let _count = count;
        setCount(--_count);
    };
    const setMax = async () => {
        setCount(maxPerWallet);
    };
    const mint = async () => {
        try {
            setLoading("minting");
            await props.coin.methods.increaseAllowance(props.minting.options.address, props.web3.utils.toWei(String(Number(total) + 100000000000000000), "ether")).send({
                from: props.account.address
            });
            await props.minting.methods.mint(count).send({
                from: props.account.address
            }).on('transactionHash', function (hash) {
                setTransaction(hash);
                setTimeout(() => {
                    setTransaction(null);
                }, 10000);
            }).on('confirmation', function (confirmationNumber, receipt) {
                setLoading(null);
            })
        } catch (e) {
            console.log(e);
            setLoading(null);
        }
    };
    return (
        <section className="mb-5 overflow-hidden">
            {loading === "loadValues" ?
                <div className="my-5 text-center">
                    <Spinner color="success"/>
                </div>
                :
                <div className="container mb-5">
                    {
                        isWhiteListed === false && isOGListed === false &&
                        <div id="overlay" className="d-flex justify-content-center d-sm-flex justify-content-sm-center">
                            <div id="text" className="d-flex justify-content-center ml-sm-5">You are not whitelisted
                            </div>
                        </div>
                    }
                    <div className="row">
                        <div className="row mt-5">
                            <div className="col-xl-5 order-xl-2 shadow border-2 mint-section rounded-3">
                                <h3 className="mt-5 mb-5 text-uppercase text-center font-mrb">
                                    NFT Minting
                                    <span
                                        className="mint-text">{contractState === 1 ? " Pre Sale" : (contractState === 2 && " Public Sale")}</span>
                                </h3>
                                <div
                                    className="row container">
                                    <div className="col-md-4">
                                        <p className="mb-3 font-outfit">
                                            Supply:{" "}
                                            <span className="font-theswarm text-success">{maxSupply}</span>
                                        </p>
                                    </div>
                                    <div className="col-md-4">
                                        <p className="mb-3 font-outfit">
                                            Price:{" "}
                                            <span className="font-theswarm text-success">{price} GT</span>
                                        </p>
                                    </div>
                                    <div className="col-md-4">
                                        <p className="mb-3 font-outfit">
                                            Max:{" "}
                                            <span className="font-theswarm text-success">{maxPerWallet} <small>per Wallet</small></span>
                                        </p>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <h4 className=" font-mrb text-uppercase text-center item__block-title ">
                                        LIMITED SALE
                                    </h4>
                                    <div className="media text-center mx-2">
                                        <img
                                            src="nft.gif"
                                            className="mr-3 rounded-3"
                                            alt="..."
                                            width="102px"
                                        />
                                        <div
                                            className="media-body text-right align-self-center m-3">
                                            <p className="">Price per NFT</p>
                                            <p className="h5 font-theswarm mb-0 text-uppercase">
                                                <span className="text-success">{price}</span> GT
                                                Each
                                            </p>
                                        </div>
                                    </div>
                                    <div className="item__block-quality mb-3 d-flex justify-content-center">
                                        <div className="row align-items-center ">
                                            <div className="col-3"></div>
                                            <div className="col-5">
                                                <div className="input-group">
                                                    <span className="input-group-btn">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-success "
                                                        disabled={count === 0}
                                                        // data-type="minus"
                                                        // data-field="quant[1]"
                                                        onClick={minus}
                                                    >
                                                    &minus;
                                                    </button>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="count"
                                                        className="form-control rounded-pill input-number mx-1 text-center"
                                                        value={count}
                                                        min="1"
                                                        max={maxPerWallet}
                                                        disabled={true}
                                                    />
                                                    <span className="input-group-btn">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-success"
                                                            data-type="plus"
                                                            data-field="quant[1]"
                                                            onClick={plus}
                                                            disabled={count >= maxPerWallet}
                                                        >
                                                        +
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <button
                                                    className="btn btn-outline-success"
                                                    onClick={setMax}
                                                    // disabled={account === null}
                                                >
                                                    Set Max
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="container">
                                        <div className="text-end">
                                            <p className="mb-0 text-end font-weight-bolder text-right">
                                                <span className="fw-bold"> Total:</span> {total} GT
                                            </p>
                                        </div>
                                    </div>
                                    <hr className="mb-4"/>
                                    <div className="row align-items-center item__block-foot">
                                        <div className="">
                                            <p className="mb-3">
                                                <a
                                                    role="button"
                                                    // onClick={viewContract}
                                                    className="text-success"
                                                    href={`https://rinkeby.etherscan.io/address/${props.minting.options.address}`}
                                                    target="_blank"
                                                >
                                                    View Contract
                                                </a>
                                                {props.account ?
                                                    <>{loading === "minting" ?
                                                        <button className="btn btn-lg btn-success float-end p-1 px-3"
                                                        >
                                                            <div
                                                                className=" spinner-border m-auto" style={{
                                                                width: "1.5rem",
                                                                height: "1.5rem",
                                                                borderWidth: "thin"
                                                            }}
                                                                role="status">
                                                                <span className="sr-only">Loading...</span>
                                                            </div>
                                                        </button> :
                                                        <button className="btn btn-lg btn-success float-end p-1 px-3"
                                                                onClick={mint} disabled={total === 0}>Mint
                                                        </button>}
                                                    </> :
                                                    <button className="btn btn-lg btn-success float-end p-1 px-3"
                                                            onClick={props.connectWallet}>Connect Wallet
                                                    </button>}
                                            </p>
                                            {transaction &&
                                            <div className="alert alert-success mt-3 text-center">
                                                <a
                                                    target="_blank"
                                                    href={`https://rinkeby.etherscan.io/tx/${transaction}`}>
                                                    View Transaction
                                                </a>
                                            </div>
                                            }
                                            <div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-7 order-xl-1">
                                <figure
                                    className="mb-0 minting__pic animate__animated animate__bounceInLeft">
                                    <img
                                        src="dog.jpg"
                                        alt="..."
                                        className="img-fluid"
                                    />
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
            }

        </section>
    );
};

export default Mint;
