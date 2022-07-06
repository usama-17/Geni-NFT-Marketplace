import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {Link} from "react-router-dom"

function Staking(props) {
    const [loading, setLoading] = useState(null);
    const [pools, setPools] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    useEffect(() => {
        console.log(props);
        loadPoolInfo().then(_items => {
            console.log(_items);
            setPools(_items);
            // setLoading(null);
        });
    }, []);
    const loadPoolInfo = async () => {
        try {
            setLoading("loadPoolInfo");
            const poolLength = await props.staking.methods.poolLength().call();
            console.log(poolLength);
            let pools = [];
            for (let i = 0; i < poolLength; i++) {
                // const user = await props.staking.methods.userInfo(i, props.account.address).call();
                // console.log(user);
                // console.log(obj);
                // if (user.timestamp > 0) {
                // const seconds = user.timestamp / 1000;
                // const time = user.timestamp - obj.lockTime;
                // console.log(time);
                const obj = await props.staking.methods.poolInfo(i).call();
                const time = obj.lockTime;
                pools.push({
                    apy: obj.apy,
                    compoundedAmount: obj.compoundedAmount,
                    stakedAmount: obj.stakedAmount,
                    withdrawFee: obj.withdrawFee,
                    time: Math.round(time / 2628000)
                });
                // }
            }
            // console.log(pools);
            setLoading(null);
            return pools;
        } catch (e) {
            console.log(e);
            setLoading(null);
        }
    }
    const setPoolID = (id) => {
        localStorage.setItem("poolId", id);
        console.log(id);
    }
    return (
        <>
            <section style={{height: "80vh"}}>
                <Container style={{marginTop: "100px",}}>
                    <Row>{loading === "loadPoolInfo" ?
                        <div
                            className=" spinner-border-lg spinner-border text-success m-auto"
                            role="status">
                            <span className="sr-only">Loading...</span>
                        </div> :
                        <>
                            {pools.map((pool, index) => (
                                <Col md={3} key={index}>
                                    <Link style={{textDecoration: "none"}} to={`/StakingDetail/${index}`}>
                                        <div className="card staking    " onClick={() => setPoolID(index)}
                                             style={{width: "18rem", borderRadius: "20px", border: "none"}}>
                                            <h5 className="card-header staking-header">Pool {index}</h5>

                                            <div className="card-body staking-body p-3">
                                                {/*<h5 className="text-center text-success card-title mb-4">Pool 1</h5>*/}
                                                <div
                                                    className="d-flex justify-content-around  p-1 staking-div   rounded-pill mb-1">
                                                    <p className="card-text text-dark fw-bold">Average Bet Sum</p>
                                                    <p className="card-text text-dark text-muted">({pool.time} Month's)</p>
                                                </div>
                                                <div
                                                    className="d-flex justify-content-between staking-div   p-1 rounded-pill mb-1 ">
                                                    <p style={{marginLeft: "20px"}}
                                                       className="text-dark card-text fw-bold">Amount</p>
                                                    <p style={{marginRight: "20px"}}
                                                       className="text-dark card-text text-muted">{pool.compoundedAmount}</p>
                                                </div>
                                                <div
                                                    className=" d-flex justify-content-between staking-div   p-1 rounded-pill pl-1">
                                                    <p style={{marginLeft: "20px"}}
                                                       className=" text-dark card-text fw-bold ">APY</p>
                                                    <p style={{marginRight: "20px"}}
                                                       className="text-dark card-text text-muted">{pool.apy}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                            ))}
                        </>
                    }

                        {/*<Col md={3}>*/}
                        {/*    <Link style={{textDecoration: "none"}} to="/StakingDetail">*/}
                        {/*        <div className="card staking    "*/}
                        {/*             style={{width: "18rem", borderRadius: "20px", border: "none"}}>*/}
                        {/*            <h5 className="card-header staking-header">Pool 2</h5>*/}

                        {/*            <div className="card-body staking-body p-3">*/}
                        {/*                /!*<h5 className="text-center text-success card-title mb-4">Pool 1</h5>*!/*/}
                        {/*                <div*/}
                        {/*                    className="d-flex justify-content-around  p-1 staking-div rounded-pill mb-1">*/}
                        {/*                    <p className="card-text text-dark fw-bold">Average Bet Sum.</p>*/}
                        {/*                    <p className="card-text text-dark text-muted">0 month(s)</p>*/}
                        {/*                </div>*/}
                        {/*                <div*/}
                        {/*                    className="d-flex justify-content-between staking-div   p-1 rounded-pill mb-1 ">*/}
                        {/*                    <p style={{marginLeft: "20px"}}*/}
                        {/*                       className="text-dark card-text fw-bold">Amount.</p>*/}
                        {/*                    <p style={{marginRight: "20px"}}*/}
                        {/*                       className="text-dark card-text text-muted">3584178</p></div>*/}
                        {/*                <div*/}
                        {/*                    className=" d-flex justify-content-between staking-div   p-1 rounded-pill pl-1">*/}
                        {/*                    <p style={{marginLeft: "20px"}}*/}
                        {/*                       className=" text-dark card-text fw-bold">APY.</p>*/}
                        {/*                    <p style={{marginRight: "20px"}}*/}
                        {/*                       className="text-dark card-text text-muted">10%</p>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*    </Link>*/}
                        {/*</Col>*/}
                        {/*<Col md={3}>*/}
                        {/*    <Link style={{ textDecoration: "none" }} to="/StakingDetail">*/}
                        {/*        <div className="card staking    " style={{ width: "18rem", borderRadius: "20px", border: "none" }}>*/}
                        {/*            <h5 className="card-header staking-header">Pool 3</h5>*/}

                        {/*            <div className="card-body staking-body p-3">*/}
                        {/*                /!*<h5 className="text-center text-success card-title mb-4">Pool 1</h5>*!/*/}
                        {/*                <div className="d-flex justify-content-around  p-1 staking-div   rounded-pill mb-1">*/}
                        {/*                    <p className="card-text text-dark fw-bold">Average Bet Sum.</p>*/}
                        {/*                    <p className="card-text text-dark text-muted">0 month(s)</p>*/}
                        {/*                </div>*/}
                        {/*                <div className="d-flex justify-content-between staking-div   p-1 rounded-pill mb-1 ">*/}
                        {/*                    <p style={{ marginLeft: "20px" }} className="text-dark card-text fw-bold">Amount.</p>*/}
                        {/*                    <p style={{ marginRight: "20px" }} className="text-dark card-text text-muted">3584178</p></div>*/}
                        {/*                <div className=" d-flex justify-content-between staking-div   p-1 rounded-pill pl-1">*/}
                        {/*                    <p style={{ marginLeft: "20px" }} className=" text-dark card-text fw-bold">APY.</p>*/}
                        {/*                    <p style={{ marginRight: "20px" }} className="text-dark card-text text-muted">10%</p>*/}
                        {/*                </div>*/}


                        {/*            </div>*/}
                        {/*        </div>*/}

                        {/*    </Link>*/}

                        {/*</Col>*/}
                        {/*<Col md={3}>*/}
                        {/*    <Link style={{textDecoration: "none"}} to="/StakingDetail">*/}
                        {/*        <div className="card staking    " style={{ width: "18rem", borderRadius: "20px", border: "none" }}>*/}
                        {/*            <h5 className="card-header staking-header">Pool 4</h5>*/}

                        {/*            <div className="card-body staking-body p-3">*/}
                        {/*                /!*<h5 className="text-center text-success card-title mb-4">Pool 1</h5>*!/*/}
                        {/*                <div className="d-flex justify-content-around  p-1 staking-div rounded-pill mb-1">*/}
                        {/*                    <p className="card-text text-dark fw-bold">Average Bet Sum.</p>*/}
                        {/*                    <p className="card-text text-dark">0 month(s)</p>*/}
                        {/*                </div>*/}
                        {/*                <div className="d-flex justify-content-between staking-div p-1 rounded-pill mb-1">*/}
                        {/*                    <p style={{ marginLeft: "20px" }} className="text-dark card-text fw-bold">Amount.</p>*/}
                        {/*                    <p style={{ marginRight: "20px" }} className="text-dark card-text text-muted">3584178</p></div>*/}
                        {/*                <div className=" d-flex justify-content-between staking-div   p-1 rounded-pill pl-1">*/}
                        {/*                    <p style={{ marginLeft: "20px" }} className=" text-dark card-text fw-bold">APY.</p>*/}
                        {/*                    <p style={{ marginRight: "20px" }} className="text-dark card-text text-muted">10%</p>*/}
                        {/*                </div>*/}

                        {/*            </div>*/}
                        {/*        </div>*/}

                        {/*    </Link>*/}

                        {/*</Col>*/}
                    </Row>
                </Container>

            </section>


        </>
    );
}

export default Staking;