import React, {useEffect, useRef, useState} from "react";
import "./header.css";
import {Badge, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import Swal from 'sweetalert2';
import {NavLink} from "react-router-dom";
import constants from "../../config/Constants.json";
// import logo from "../../assets/images/My project.jpg"

const NAV__LINKS = [
    {
        display: "Home",
        url: "/home",
    },
    {
        display: "Mint",
        url: "/mint",
    },
    {
        display: "Staking",
        url: "/stakes",

    },
    {
        display: "Market",
        url: "/market",
    },
    {
        display: "Create",
        url: "/create",
    },
    {
        display: "Profile",
        url: "/profile",
    },
];

const Header = ({connectWallet, account, marketplace, web3}) => {
    const headerRef = useRef(null);
    const menuRef = useRef(null);
    const [dropdownOpen, setDropDownOpen] = useState(false);
    const [balance, setBalance] = useState("");

    useEffect(() => {
        window.addEventListener("scroll", () => {
            if (
                document.body.scrollTop > 80 ||
                document.documentElement.scrollTop > 80
            ) {
                headerRef.current.classList.add("header__shrink");
            } else {
                headerRef.current.classList.remove("header__shrink");
            }
        });

        return () => {
            window.removeEventListener("scroll", null);
        };
    }, []);
    useEffect(() => {
        getBalance().then(async _funds => {
            // console.log(_funds)
            setBalance(web3.utils.fromWei(_funds, "ether"));
        })
    }, [account])

    const toggleMenu = () => menuRef.current.classList.toggle("active__menu");

    const toggle = () => {
        setDropDownOpen(!dropdownOpen);
    }
    const getBalance = async () => {
        if (account) {
            const funds = await marketplace.methods._userFunds(account.address).call();
            return funds;
        }
    }
    const claimMyFunds = async () => {
        await marketplace.methods.claimFunds().send(
            {from: account.address}
        ).on('transactionHash', function (hash) {
        })
            .on('confirmation', function (confirmationNumber, receipt) {
                if (confirmationNumber === constants.transactionLimit) {
                    Swal.fire({
                        title: 'Claimed!',
                        text: 'Funds Added into Wallet.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 4000
                    })
                }
            })
    }
    return (
        <header className="header" ref={headerRef}>
            <Container>
                <div className="navigation">
                    <div className="logo">
                        <h2 className="d-flex gap-2 align-items-center ">
                            <span>
                                {/*<i className="ri-fire-fill"/>*/}
                                <img src="https://geniteam.com/img/logo.png" alt="" width="100px"/>
                            </span>

                        </h2>
                    </div>
                    <div className="nav__menu" ref={menuRef} onClick={toggleMenu}>
                        <ul className="nav__list">
                            {NAV__LINKS.map((item, index) => (

                                <li className="nav__item" key={index}>
                                    <NavLink
                                        to={item.url}
                                        className={(navClass) =>
                                            navClass.isActive ? "active" : ""
                                        }
                                    >
                                        {item.display}
                                    </NavLink>

                                </li>
                            ))}
                            <a className="text-white text-decoration-none"
                               href={`https://app.uniswap.org/#/swap?outputCurrency=0xc01c3E9507bd191d746E3789BB262f36eC9Fbd93&chain=rinkeby`}
                               target="_blank"
                               rel="noopener noreferrer"
                            >
                                Buy Coin Now
                            </a>
                        </ul>
                    </div>

                    <div className="nav__right d-flex justify-content-start align-items-center gap-4 ">
                        {account &&
                        <>
                            {balance > 0 ?
                                <div>
                                    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                                        <DropdownToggle tag="h6" className="mb-0 text-white border rounded px-2 py-1"
                                                        role="button" caret>
                                    <span className="me-1">
                                        <i className="fab fa-ethereum me-1"/> {balance}
                                    </span>
                                        </DropdownToggle>
                                        <DropdownMenu className="py-0 my-2 border-0 bg-dark" right>
                                            <DropdownItem className="py-0 my-0 rounded coinDropDown bg-dark text-white">
                                                <div onClick={claimMyFunds}> Withdraw Funds</div>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div> :
                                <Badge
                                    className="fw-lighter px-3 py-2 bg-transparent borderBadge"
                                >
                                    <span className="me-1"><i className="fab fa-ethereum me-1"/> 0</span>
                                </Badge>
                            }
                        </>
                        }
                        {
                            account ?
                                <a href={`https://rinkeby.etherscan.io/address/${account.address}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                >
                                    <Badge
                                        className="fw-lighter px-3 py-2 bg-transparent borderBadge"
                                    >
                                        {account.address} <sup><i className="fas fa-external-link-alt ms-1"/></sup>
                                    </Badge>
                                </a> :
                                <button className="btn d-flex gap-2 align-items-center" onClick={connectWallet}>
                                    <i className="ri-wallet-line"/> Connect Wallet
                                </button>
                        }
                        <span className="mobile__menu">
              <i className="ri-menu-line" onClick={toggleMenu}/>
            </span>
                    </div>
                </div>
            </Container>
        </header>
    );
};

export default Header;
