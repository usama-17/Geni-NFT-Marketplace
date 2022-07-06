import React from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";
import {Col, Container, Row} from "reactstrap";

import "../styles/wallet.css";

const Wallet = (props) => {
    return (
        <>
            <CommonSection title="Connect Wallet"/>
            <section>
                <Container>
                    <Row>
                        <Col lg="12" className="mb-5 text-center">
                            <div className="w-50 m-auto">
                                <h3 className="text-light">Connect your wallet</h3>
                                <p>Connect with one of our available wallet providers or create a new one.</p>
                                <div className="card text-start rounded-3">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item" role="button"
                                            onClick={() => props.connectWallet()}>
                                            <Row>
                                                <Col lg="2">
                                                    <img src="metamask.png" alt="" width="50px" className="mt-1 p-0"/>
                                                </Col>
                                                <Col lg="7" className="py-2 fw-bold text-muted">MetaMask</Col>
                                                <Col lg="3">
                                                    <button style={{backgroundColor: 'rgb(32,129,226)'}}
                                                            className=" rounded-pill text-white float-end px-2 "
                                                            disabled="true">Popular
                                                    </button>
                                                </Col>
                                            </Row>
                                        </li>
                                        <li className="list-group-item" role="button">
                                            <Row>
                                                <Col lg="2">
                                                    <img src="coinbase.png" alt="" width="50px" className=" p-0"/>
                                                </Col>
                                                <Col lg="7" className="py-2 fw-bold text-muted">Coinbase Wallet</Col>
                                                <Col lg="3"><span
                                                    className="float-end fw-light">Coming Soon</span></Col>
                                            </Row>
                                        </li>
                                        <li className="list-group-item" role="button">
                                            <Row>
                                                <Col lg="2">
                                                    <img src="walletConnect.png" alt="" width="50px" className=" p-0"/>
                                                </Col>
                                                <Col lg="7" className="py-2 fw-bold text-muted">WalletConnect</Col>
                                                <Col lg="3"><span
                                                    className="float-end fw-light">Coming Soon</span></Col>
                                            </Row>
                                        </li>
                                    </ul>
                                </div>
                                {/*<h3 className="text-light">Connect your wallet</h3>*/}
                                {/*<p>*/}
                                {/*  Lorem ipsum dolor sit amet consectetur, adipisicing elit.*/}
                                {/*  Minima numquam nisi, quam obcaecati a provident voluptas sequi*/}
                                {/*  unde officiis placeat!*/}
                                {/*</p>*/}
                            </div>
                        </Col>

                        {/*{wallet__data.map((item, index) => (*/}
                        {/*  <Col lg="3" md="4" sm="6" key={index} className="mb-4">*/}
                        {/*    <div className="wallet__item">*/}
                        {/*      <span>*/}
                        {/*        <i class={item.icon}></i>*/}
                        {/*      </span>*/}
                        {/*      <h5>{item.title}</h5>*/}
                        {/*      <p>{item.desc}</p>*/}
                        {/*    </div>*/}
                        {/*  </Col>*/}
                        {/*))}*/}
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default Wallet;
