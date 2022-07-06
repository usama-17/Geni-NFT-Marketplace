import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import "./hero-section.css";

import heroImg from "../../assets/images/hero.jpg";
import geniImage from "../../assets/images/heroImage3.png"

const HeroSection = () => {
  return (
    <section  className="hero__section">
      <Container>
        <Row>
          <Col lg="6" md="6">
            <div className="hero__content">
              <h2 style={{color:"black"}}>
                Discover rare digital art and collect
                <span style={{color:"#88B34E"}}>sell extraordinary</span> NFTs
              </h2>
              <p style={{color:"black"}}>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Deleniti excepturi omnis neque adipisci sequi ullam unde in
                minus quis quos.
              </p>

              <div className="hero__btns d-flex align-items-center gap-4">
                <button className=" explore__btn d-flex align-items-center gap-2">
                  <i className="ri-rocket-line"/>{" "}
                  <Link to="/market">Explore</Link>
                </button>
                <button className=" create__btn d-flex align-items-center gap-2">
                  <i className="ri-ball-pen-line"/>
                  <Link to="/create">Create</Link>
                </button>
              </div>
            </div>
          </Col>

          <Col lg="6" md="6">
            <div className="hero__img">
              <img src={geniImage} alt="" className="w-100" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
