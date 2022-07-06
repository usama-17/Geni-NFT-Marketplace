import React from "react";

import {Col, Container, Row} from "reactstrap";
import "./footer.css";

import {Link} from "react-router-dom";

const MY__ACCOUNT = [
  {
    display: "Author Profile",
    url: "/seller-profile",
  },
  {
    display: "Create Item",
    url: "/create",
  },
  {
    display: "Collection",
    url: "/market",
  },
  {
    display: "Edit Profile",
    url: "/edit-profile",
  },
];

const RESOURCES = [
  {
    display: "Help Center",
    url: "#",
  },
  {
    display: "Partner",
    url: "#",
  },
  {
    display: "Community",
    url: "#",
  },
  {
    display: "Activity",
    url: "#",
  },
];

const COMPANY = [
  {
    display: "About",
    url: "#",
  },
  {
    display: "Career",
    url: "#",
  },
  {
    display: "Ranking",
    url: "#",
  },
  {
    display: "Contact Us",
    url: "/contact",
  },
];

const Footer = () => {
  return (
      <footer className="footer fixed-bottom">
        <Container>
          <Row>
            <Col lg="4" md="6" sm="6">
              <div className="logo">
                <h2 className=" d-flex gap-2 align-items-center ">

                  <img height={"60px"} src="/logo1.png"/>
                </h2>

              </div>
          </Col>

          {/*<Col lg="2" md="3" sm="6" className="mb-4">*/}
          {/*  <h5>My Account</h5>*/}
          {/*  <ListGroup className="list__group">*/}
          {/*    {MY__ACCOUNT.map((item, index) => (*/}
          {/*      <ListGroupItem key={index} className="list__item">*/}
          {/*        <Link to={item.url}> {item.display} </Link>*/}
          {/*      </ListGroupItem>*/}
          {/*    ))}*/}
          {/*  </ListGroup>*/}
          {/*</Col>*/}


          <Col lg="4">
            <p className="copyright">
              {" "}
              Copyrights 2022, GeniTeam.
              All Rights Reserved.{" "}
            </p>
          </Col>


          <Col lg="4" md="6" sm="6" className="d-flex justify-content-end">
            <div className="social__links d-flex gap-3 align-items-center ">
              <span>
                <Link to="#">
                  <i className="ri-facebook-line"/>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-instagram-line"/>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-twitter-line"/>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-telegram-line"/>
                </Link>
              </span>
              <span>
                <Link to="#">
                  <i className="ri-discord-line"/>
                </Link>
              </span>
            </div>
          </Col>


        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
