import React, { useState, useEffect } from 'react';

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion">
      <button className="accordion-header" onClick={() => setOpen((v) => !v)}>
        <span>{title}</span>
        <span className="chev">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="accordion-content">{children}</div>}
    </div>
  );
}

function Counter({ end, label }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    if (end <= 0) return;
    const duration = 1200;
    const stepTime = Math.max(10, Math.floor(duration / end));
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / stepTime));
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [end]);
  return (
    <div className="counter">
      <div className="counter-value">{value}</div>
      <div className="counter-label">{label}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="about-page container">
      <header className="about-hero">
        <h1>A.R.M. CEMENT KING</h1>
        <p className="lead">Leading retailers of Cement & Steel serving Pudukkottai since 1990.</p>
      </header>

      <section className="about-grid">
        <div className="about-main">
          <Accordion title="Company Overview">
            <p>
              A.R.M. was the first dealer for ACC cement in Pudukkottai district. Later Ramco Cement and all other leading cement companies appointed A.R.M as their dealer for Pudukkottai district. A.R.M soon turned out to be The "Cement King" of Pudukkottai District.
            </p>
            <p>
              In 11.06.2000 A.R.M inaugurated the largest steel yard in Pudukkottai. As a leading steel dealer of the town, we have installed computerised weighing mechanism to serve to the community at the best.
            </p>
            <p>
              On 19.5.2010 A.R.M inaugurated the exclusive parryware sanitary ware show room and Asian tiles display in pudukkottai. Products are offered at very competitive prices, affordable to customers, engineers and contractors.
            </p>
          </Accordion>

          <Accordion title="Business Details">
            <ul className="info-list">
              <li><strong>Nature of Business:</strong> Retailer</li>
              <li><strong>Legal Status:</strong> Proprietorship</li>
              <li><strong>Annual Turnover:</strong> 5 - 25 Cr</li>
              <li><strong>GST Registration Date:</strong> 01-07-2017</li>
              <li><strong>GST Number:</strong> 33AADPJ8789Q1ZT</li>
            </ul>
          </Accordion>
 
          <Accordion title="Materials Theory">
            <div className="theory">
              <p className="theory-intro">
                Here are concise, practical notes about cement, steel and concrete that we follow at A.R.M. These help customers and contractors select the right materials for reliable construction.
              </p>

              <h4 className="theory-title">Cement Basics</h4>
              <ul>
                <li><span className="keyword">Ordinary Portland Cement (OPC)</span> is commonly used for general construction; available in grades <span className="highlight">33, 43, 53</span> representing compressive strength (MPa).</li>
                <li><span className="keyword">Pozzolanic cements</span> (PPC) include industrial byproducts for improved durability and lower heat of hydration.</li>
              </ul>

              <h4 className="theory-title">Steel & Reinforcement</h4>
              <ul>
                <li><span className="keyword">Fe 415 / Fe 500</span> are typical grade designations for reinforcing steel indicating yield strength (N/mm²).</li>
                <li>Choose ribbed bars for bonding with concrete; use corrosion-protected bars for coastal locations.</li>
              </ul>

              <h4 className="theory-title">Concrete Mix & Durability</h4>
              <ul>
                <li>Concrete strength depends on <span className="keyword">cement:aggregate:water</span> ratio and compaction. Lower water = higher strength (but harder to place).</li>
                <li>Typical grades: <span className="highlight">M20, M25, M30</span> (compressive strength in MPa). Select based on structural requirements.</li>
              </ul>

              <p className="theory-note">If you'd like, we can expand this into a printable reference PDF for customers.</p>
            </div>
          </Accordion>
        </div>

        <aside className="about-side">
          <div className="stats">
            <Counter end={30} label="Years in Business" />
            <Counter end={6} label="Branches" />
            <Counter end={5000} label="Customers" />
            <Counter end={120} label="Products" />
          </div>

          <div className="contact-cta card">
            <h3>Contact Us</h3>
            <p>Want to enquire or partner with us? Call: <strong>8838052328</strong></p>
            <button className="btn-primary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Reach Out</button>
          </div>
        </aside>
      </section>
    </div>
  );
}