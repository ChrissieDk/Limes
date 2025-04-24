// src/components/Hero.tsx

import React from "react";
import HeroBackground from "../assets/home/Hero Background Full Screen Grid.svg";
import HeroGraphic from "../assets/home/Website Hero Full Graphic.png";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-[#1a1920] overflow-hidden text-white min-h-screen">
      {/* Background Grid */}
      <img
        src={HeroBackground}
        alt="Background Grid"
        className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none"
      />

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center">
        {/* Left Side - Text */}
        <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
          {/* Badges */}
          <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6 text-sm font-medium">
            <span className="flex items-center text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
              Flexible data
            </span>
            <span className="flex items-center text-pink-400">
              <span className="w-2 h-2 rounded-full bg-pink-400 mr-2"></span>
              Real cashback
            </span>
            <span className="flex items-center text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
              Seamless digital services
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-7xl font-bold leading-tight mb-6">
            Stay connected.
            <br />
            Earn cash back.
            <br />
            Own your money.
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 max-w-md mx-auto lg:mx-0 mb-8">
            Join the Limes community and unlock data, rewards, and banking in
            one simple package.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button className="bg-lime-400 hover:bg-lime-300 text-black font-semibold py-3 px-6 rounded-full">
              Explore Packages
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-full">
              Why Choose Limes?
            </button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <img
            src={HeroGraphic}
            alt="Limes Hero Graphic"
            className="max-w-3xl w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
