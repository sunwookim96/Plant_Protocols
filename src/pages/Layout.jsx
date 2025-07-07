
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Leaf, User as UserIcon, LogOut } from "lucide-react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      // 사용자가 로그인하지 않은 경우 처리
      console.log("사용자가 로그인하지 않았습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    }
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith(createPageUrl("Results"))) {
      return "데이터 분석 및 결과";
    }
    if (location.pathname.startsWith(createPageUrl("Analysis"))) {
      return "분석 프로토콜";
    }
    return "Plant Biochemical Analysis";
  };

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
      `}</style>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 ios-blur bg-white/80 border-b border-gray-200/60 ios-shadow">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Link to={createPageUrl("Analysis")} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ios-shadow">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 tracking-tight">PlantAnalyzer</h1>
                    <p className="text-xs text-gray-500 font-medium">{getPageTitle()}</p>
                  </div>
                </Link>
              </div>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-10 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 ios-card ios-blur rounded-2xl ios-shadow-lg border-0 p-2">
                    <div className="px-3 py-2 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 rounded-xl p-3 text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />
                      <span>로그아웃</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}
