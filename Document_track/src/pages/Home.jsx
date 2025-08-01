import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <video autoPlay loop muted className="background-video">
        <source src="/nlc-30.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="overlay-content">
        <h1>NLC India Ltd.</h1>
        <p>
          A Navratna Government of India Enterprise under the Ministry of Coal,
          pioneering in Lignite Mining and Power Generation since 1956.
        </p>
      </div>

      <div className="info-section container text-white mt-5">
        <section className="mb-5">
          <h2>About NLC</h2>
          <p>
            NLC India Limited (formerly Neyveli Lignite Corporation) is a leader
            in the energy sector with core operations in mining and thermal
            power generation. Headquartered in Neyveli, Tamil Nadu, NLC has
            expanded across India with multiple power stations and renewable
            energy initiatives.
          </p>
        </section>

        <section className="mb-5">
          <h2>Our Vision</h2>
          <p>
            To emerge as a world-class energy company, powering India's growth with
            sustainable, affordable, and green energy solutions.
          </p>
        </section>

        <section className="mb-5">
          <h2>Core Operations</h2>
          <ul>
            <li>Lignite Mining (over 30 million tonnes annually)</li>
            <li>Thermal Power Generation (installed capacity: 6,000+ MW)</li>
            <li>Renewable Energy: Solar and Wind projects across states</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2>Sustainability & Innovation</h2>
          <p>
            NLC actively promotes eco-friendly initiatives including afforestation,
            solar parks, rainwater harvesting, and environmental stewardship.
          </p>
        </section>

        <section className="mb-5">
          <h2>Contact</h2>
          <p>
            NLC India Ltd., Corporate Office, Neyveli Township<br />
            Phone: +91 44 2235 0135<br />
            Email: info@nlcindia.in
          </p>
        </section>
      </div>
    </div>
  );
}

export default Home;
