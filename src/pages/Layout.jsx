
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, Home, TestTube, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // 현재 페이지 상태 확인 - 루트 경로도 홈으로 인식
  const isHomePage = currentPageName.toLowerCase().includes("home") || location.pathname === "/";
  const isResultsPage = currentPageName.includes("Results");
  const isAnalysisPage = currentPageName.includes("Analysis");
  const isHPLCPage = location.pathname.includes("HPLC");

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .ios-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .ios-shadow {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 20px rgba(0, 0, 0, 0.03);
        }
        
        .ios-shadow-lg {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 30px rgba(0, 0, 0, 0.06);
        }
        
        .ios-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .ios-button {
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        
        .ios-button-secondary {
          background: rgba(142, 142, 147, 0.12);
          color: #007AFF;
          border: none;
          border-radius: 12px;
          font-weight: 600;
        }
        
        .ios-input {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          font-size: 16px;
          padding: 16px;
        }
        
        .ios-input:focus {
          border-color: #007AFF;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
        }

        /* Hide number input arrows */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        /* Mobile responsive improvements */
        @media (max-width: 640px) {
          .ios-input {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 12px;
          }
        }

        /* Navigation buttons */
        .nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #6B7280;
          transition: all 0.3s ease;
        }
        
        .nav-button:hover {
          background: rgba(0, 122, 255, 0.1);
          color: #007AFF;
        }
        
        .nav-button.active {
          background: #007AFF;
          color: white;
        }
      `}</style>

      <header className="relative z-10">
        <div className="bg-white/80 backdrop-blur-lg ios-shadow border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link 
                to={createPageUrl("Home")} 
                className="flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Instrumental Analysis
                </span>
              </Link>
              
              <div className="flex items-center space-x-3">
                {/* Navigation Buttons */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Link 
                    to={createPageUrl("Home")}
                    className={`nav-button ${isHomePage ? 'active' : ''}`}
                    title="홈"
                  >
                    <Home className="h-4 w-4" />
                  </Link>
                  <Link 
                    to={createPageUrl("Analysis")}
                    className={`nav-button ${isAnalysisPage ? 'active' : ''}`}
                    title="흡광도"
                  >
                    <TestTube className="h-4 w-4" />
                  </Link>
                  <Link 
                    to={createPageUrl("HPLC")}
                    className={`nav-button ${isHPLCPage ? 'active' : ''}`}
                    title="HPLC"
                  >
                    <FlaskConical className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
