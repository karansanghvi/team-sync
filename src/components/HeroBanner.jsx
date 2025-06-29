import React from 'react'
import { useNavigate } from 'react-router-dom'

function HeroBanner() {

  const navigate = useNavigate();
  
  const handleGetStartedButton = () => {
    navigate('/login');
  };

  return (
    <>
      <section className='heroSection'>
        <h1>TeamSync</h1>
        <div className="container">
            <button 
              id="btnGetStarted" 
              onClick={handleGetStartedButton} 
              className="primary-button"
            >
              Get Started
            </button>
        </div>
      </section>
    </>
  )
}

export default HeroBanner
