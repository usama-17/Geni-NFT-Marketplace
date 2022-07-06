import React, {useEffect, useState} from "react";
import "../Header/header.css";
import Routers from "../../routes/Routers";
import Header from "../Header/Header";
import {characters, coin, marketplace, minting, skins, staking} from "../../config";
import Web3 from "web3";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import Footer from "../Footer/Footer";
import {collection, doc, getDocs, setDoc} from "firebase/firestore";
import {db} from '../../firebase';

const Layout = () => {
    const [web3, setWeb3] = useState(null);
    const [charactersContract, setCharactersContract] = useState(null);
    const [skinsContract, setSkinsContract] = useState(null);
    const [coinContract, setCoinContract] = useState(null);
    const [marketplaceContract, setMarketplaceContract] = useState(null);
    const [stakingContract, setStakingContract] = useState(null);
    const [mintingContract, setMintingContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState("all");
    const [openModal, setOpenModal] = useState(false);

    useEffect(async () => {
        // Check if browser is running Metamask
        let _web3;
        if (window.ethereum) {
            // on testing, connect to Rinkeby node
            _web3 = new Web3(window.ethereum);
            _web3.eth.getAccounts().then(_accounts => console.log(_accounts));
            // _web3 = new Web3(window.ethereum);
            setContracts(_web3);
            let _account = await _web3.eth.getAccounts();
            if (_account.length > 0) {
                await addUser(_account[0]);
                // setAccount(_account[0]);
            }
            console.log(_account[0]);
        } else if (window.web3) {
            _web3 = new Web3(window.web3.currentProvider);
        } else {
            _web3 = new Web3(Web3.givenProvider);
        }

        setWeb3(_web3);

        checkConnection(_web3).then(r => {
        });
    }, []);

    const addUser = async (_account) => {
        if (_account) {
            let users = [], isUserExist = null, user = null;
            const favRef = collection(db, "users");
            const fav = await getDocs(favRef);
            fav.forEach((e) => {
                users.push(e.data());
            })
            console.log(users);
            users.forEach(_user => {
                if (_user.address.toLowerCase() === _account.toLowerCase()) {
                    user = _user;
                    isUserExist = true;
                }
            })
            const userRef = doc(db, "users", _account.toLowerCase());
            if (!isUserExist) {
                await setDoc(userRef, {address: _account.toLowerCase(), favourites: [], funds: 0}, {merge: true});
                user = {address: _account.toLowerCase(), favourites: [], funds: 0};
            }
            setAccount(user);
        } else {
            setAccount(null);
        }

    }

    const listener = () => {
        // Add listeners
        window.ethereum.on("accountsChanged", async (accounts) => {
            await addUser(accounts[0]);
            console.log(accounts[0]);
        });
        window.ethereum.on("chainChanged", async () => {
            window.location.reload();
        });
    }
    const toggle = () => {
        setOpenModal(!openModal);
    }
    const modalOpen = async () => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{chainId: '0x4'}], // chainId must be in hexadecimal numbers
        });
    }
    const checkConnection = async (_web3) => {
        try {
            const networkId = await window.ethereum.request({
                method: "net_version",
            });
            // Check if User is already connected by retrieving the accounts
            const accounts = await _web3.eth.getAccounts();
            if (accounts.length > 0) {
                await addUser(accounts[0])
                // setAccount(accounts[0]);
            }
            setLoading(null);
            listener();
            if (Number(networkId) !== 4) {
                setAccount(null);
                setOpenModal(true);
            }
        } catch (e) {
            setLoading(null);
        }
    }
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                const networkId = await window.ethereum.request({
                    method: "net_version",
                });
                if (Number(networkId) === 4) {
                    setContracts(web3);
                    // setAccount(accounts[0]);
                    await addUser(accounts[0]);
                } else {
                    setOpenModal(true);
                    console.log("Change network to ETH");
                }
            } catch (err) {
                console.log(err);
                // setError("Something went wrong.");
            }
        } else {
            console.log("Install Metamask.");
        }
    }
    const setContracts = (web3) => {
        const _charactersContract = new web3.eth.Contract(
            characters.abi,
            characters.address
        );
        const _skinsContract = new web3.eth.Contract(
            skins.abi,
            skins.address
        );
        const _coinContract = new web3.eth.Contract(
            coin.abi,
            coin.address
        );
        const marketplaceContract = new web3.eth.Contract(
            marketplace.abi,
            marketplace.address
        );
        const _stakingContract = new web3.eth.Contract(
            staking.abi,
            staking.address
        )
        const _mintingContract = new web3.eth.Contract(
            minting.abi,
            minting.address
        )
        setCharactersContract(_charactersContract);
        setSkinsContract(_skinsContract);
        setCoinContract(_coinContract);
        setMarketplaceContract(marketplaceContract);
        setStakingContract(_stakingContract);
        setMintingContract(_mintingContract);
    }

    return (
        <div>

            {
                loading === "all" ?
                    <div className="text-center w-100 py-5 my-5">
                        <Spinner size="lg" color="white"/>
                    </div> :
                    <>
                        <div>
                            <Modal isOpen={openModal} className="text-dark mt-5  ">
                                <ModalHeader className="bg-white">Please switch to Rinkeby network</ModalHeader>
                                <ModalBody className="bg-white">
                                    In order to trade items, please switch to Rinkeby network within your MetaMask
                                    wallet.
                                </ModalBody>
                                <ModalFooter className="nav__right d-flex align-items-center bg-white ">
                                    <Button className="rounded-pill btn-secondary" onClick={toggle}>Cancel</Button>{' '}
                                    <Button className="" style={{backgroundColor: "#89B450"}} onClick={modalOpen}>Switch
                                        Network</Button>
                                </ModalFooter>
                            </Modal>
                        </div>
                        <Header connectWallet={connectWallet} account={account} marketplace={marketplaceContract}
                                web3={web3}/>
                        <div className="mt-5">
                            <Routers web3={web3} account={account} marketplace={marketplaceContract}
                                     connectWallet={connectWallet} characters={charactersContract} skins={skinsContract}
                                     coin={coinContract} staking={stakingContract} minting={mintingContract}/>
                        </div>
                        <Footer/>
                    </>
            }
        </div>
    );
};

export default Layout;
