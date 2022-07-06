import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js';
import {Doughnut} from 'react-chartjs-2';
import {useParams} from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

function StakingDetail(props) {
    const {id} = useParams();
    const [stakeAmount, setStakeAmount] = useState("");
    const [balance, setBalance] = useState("");
    const [error, setError] = useState("");
    const [user, setUser] = useState({});
    const [transaction, setTransaction] = useState("");
    const [loading, setLoading] = useState(null);
    const [pool, setPool] = useState({});
    const data = {
        labels: ['Invested Funds', 'Earned', 'Annual Interest'],
        datasets: [
            {
                label: '# of Votes',
                data: user.timestamp > 0 ? [props.web3.utils.fromWei(String(user.amount), "ether"), props.web3.utils.fromWei(String(user.rewardDebt), "ether"), pool.apy] : [50, 50, 50],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 3,

            },
        ],
    };
    useEffect(async () => {
        const _balance = await props.coin.methods.balanceOf(props.account.address).call();
        setBalance(props.web3.utils.fromWei(_balance, "ether"))
        loadUserInfo().then(_items => {
            console.log(_items);
            setUser(_items);
            // setLoading(null);
        });
        loadPoolInfo().then(_items => {
            console.log(_items);
            setPool(_items);
            // setLoading(null);
        });

    }, []);

    const loadUserInfo = async () => {
        try {
            const _user = await props.staking.methods.userInfo(id, props.account.address).call();
            return {amount: _user.amount, rewardDebt: _user.rewardDebt, timestamp: _user.timestamp};
        } catch (e) {
            console.log(e)
        }
    }
    const loadPoolInfo = async () => {
        try {
            setLoading("loadPoolInfo");
            const obj = await props.staking.methods.poolInfo(id).call();
            const time = obj.lockTime;
            setLoading(null);
            return {
                apy: obj.apy,
                compoundedAmount: obj.compoundedAmount,
                stakedAmount: obj.stakedAmount,
                withdrawFee: obj.withdrawFee,
                time: Math.round(time / 2628000)
            };
        } catch (e) {
            console.log(e);
            setLoading(null);
        }
    }
    const handleChange = (e) => {
        setStakeAmount(e.target.value);
    }
    const stake = async () => {
        try {
            console.log(props.web3.utils.toWei(String(stakeAmount), "ether"));
            // const _price = Number(stakeAmount) + 100000000000000000;
            // console.log(_price);
            await props.coin.methods.increaseAllowance(props.staking.options.address, props.web3.utils.toWei(String(stakeAmount), "ether")).send({
                from: props.account.address
            });
            await props.staking.methods.deposit(id, props.web3.utils.toWei(String(stakeAmount), "ether")).send({
                from: props.account.address
            }).on('transactionHash', function (hash) {
                setTransaction(hash);
            }).on('confirmation', function (confirmationNumber, receipt) {
                window.location.reload();
            }).once("error", (err) => {
                // console.log(err);
                if (err.code === 4001)
                    setError("User Denied transaction");
                setTimeout(() => {
                    setError(null);
                }, 3000)
                setLoading(null);
            })
        } catch (e) {
            console.log(e);
            // setError(e.message);
            if (e.code === 4001)
                setError("User Denied transaction");
            setTimeout(() => {
                setError(null);
            }, 3000)
        }
    }
    const claimReward = async () => {
        console.log(id);
        await props.staking.methods.claimReward(id).send({
            from: props.account.address
        }).on('transactionHash', function (hash) {
            setTransaction(hash);
        }).on('confirmation', function (confirmationNumber, receipt) {
            window.location.reload();
        })
    }
    const withDrawFunds = async () => {
        await props.staking.methods.emergencyWithdraw(id).send({
            from: props.account.address
        }).on('transactionHash', function (hash) {
            setTransaction(hash);
        }).on('confirmation', function (confirmationNumber, receipt) {
            window.location.reload();
        })
    }
    const compound = async () => {
        await props.staking.methods.compound(id).send({
            from: props.account.address
        }).on('transactionHash', function (hash) {
            setTransaction(hash);
        }).on('confirmation', function (confirmationNumber, receipt) {
            window.location.reload();
        })
    }
    return (
        <>
            <Container style={{marginTop: "120px"}}>
                <Row>
                    <Col md={6}>
                        <div style={{
                            border: "3px solid gray",
                            marginBottom: "70px",
                            borderRadius: "20px",
                            paddingLeft: "100px",
                            paddingRight: "100px",
                            paddingBottom: "30px"
                        }} className="">
                            <div style={{padding: "20px"}}>
                                <Doughnut data={data}/>
                            </div>

                            <div className="d-flex justify-content-between">
                                <p className="staking-invest">Invested Funds:</p>
                                <p className="staking-invest">{user.timestamp > 0 ? props.web3.utils.fromWei(user.amount, "ether") : 0} GeniToken </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p className="staking-invest">Earned:</p>
                                <p className="staking-invest">{user.timestamp > 0 ? props.web3.utils.fromWei(user.rewardDebt, "ether") : 0} GeniToken </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p className="staking-invest">Annual Interest:</p>
                                <p className="staking-invest">{pool.apy}%</p>
                            </div>
                            <div className="text-center">
                                <button type="button" onClick={claimReward}
                                        className="btn btn-success border-0 mt-3 btn-lg text-center rounded-pill mx-2"
                                >Claim Reward
                                </button>
                                <button type="button"
                                        className="btn btn-success border-0 mt-3 btn-lg text-center rounded-pill mx-2"
                                        onClick={compound}>Compound
                                </button>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div style={{padding: "20px", border: "3px solid gray", borderRadius: "20px"}}>
                            <div className="d-flex justify-content-between">
                                <p className="staking-invest">You can Invest:</p>
                                <p className="staking-invest">{balance} GeniToken </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p className="staking-invest">Stake:</p>
                                <p className="staking-invest">{user.timestamp > 0 ? props.web3.utils.fromWei(user.amount, "ether") : 0} GT <i
                                    className="far  fa-lg fa-question-circle"/></p>
                            </div>
                            <div style={{
                                border: "2px solid gray",
                                borderRadius: "20px",
                                marginTop: "40px",
                                padding: "15px"
                            }}>
                                <div className="staking__input">
                                    <label htmlFor="">Input</label>
                                    <input type="number" placeholder="Enter" required
                                           onChange={handleChange} value={stakeAmount}
                                    />
                                    {/* <p style={{color:"black"}}>GeniToken</p> */}
                                </div>
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <button style={{border: "none", width: "200px"}} type="button"
                                        className="btn btn-success btn-lg text-center rounded-pill mx-2"
                                        onClick={stake}>Stake
                                </button>
                                <button style={{border: "none", width: "200px"}} type="button" onClick={withDrawFunds}
                                        className="btn btn-success btn-lg text-center rounded-pill mx-2 border-0"
                                >Withdraw Funds
                                </button>
                            </div>
                            {transaction &&
                            <div className="alert alert-success mt-3 text-center">
                                <a
                                    target="_blank"
                                    href={`https://rinkeby.etherscan.io/tx/${transaction}`}>
                                    View Transaction
                                </a>
                            </div>
                            }
                            {error ? <div className="alert alert-danger mt-3">{error}</div> : ""}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>);

}

export default StakingDetail;