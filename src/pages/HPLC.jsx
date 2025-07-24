import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const hplcAnalysisTypes = {
  phenol: {
    title: "페놀",
    subtitle: "Phenolic Compounds",
    compounds: [
      "Arbutin", "Gallic acid", "Catechin hydrate", "4-Hydroxybenzoic acid", 
      "Chlorogenic acid", "Caffeic acid", "(-)-Epicatechin", "4-Hydroxy-3-benzoic acid",
      "p-Coumaric acid", "trans-Ferulic acid", "Benzoic acid", "Rutin",
      "trans-Cinnamic acid", "Quercetin", "Kaempferol"
    ],
    icon: <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5" />
  },
  glucosinolate: {
    title: "글루코시놀레이트",
    subtitle: "Glucosinolates",
    compounds: [
      "Progoitrin", "Sinigrin", "Glucoalyssin", "Gluconapoleiferin",
      "Gluconapin", "4-Hydroxyglucobrassicin", "Glucobrassicanapin", "Glucoerucin",
      "Glucobrassicin", "4-Methoxyglucobrassicin", "Gluconasturtiin", "Neoglucobrassicin"
    ],
    icon: <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5" />
  },
  acacetin: {
    title: "아카세틴",
    subtitle: "Acacetin",
    compounds: ["Acacetin", "Acacetin-7-O-glucoside"],
    icon: <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5" />
  },
  rosmarinic_acid: {
    title: "로즈마린산",
    subtitle: "Rosmarinic Acid",
    compounds: ["Rosmarinic acid", "Caffeic acid", "Salvianolic acid B"],
    icon: <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5" />
  },
  tilianin: {
    title: "틸리아닌",
    subtitle: "Tilianin",
    compounds: ["Tilianin", "Acacetin-7-O-rutinoside"],
    icon: <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5" />
  }
};

export default function HPLC() {
  const [selectedAnalysis, setSelectedAnalysis] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // URL에서 선택된 분석 타입 확인
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selected = params.get("selected");
    if (selected) {
      setSelectedAnalysis(selected);
    } else {
      setSelectedAnalysis("");
    }
  }, [location.search]);

  const handleAnalyzeClick = () => {
    if (selectedAnalysis) {
      navigate(createPageUrl("HPLC_Results") + `?analysis_type=${selectedAnalysis}`);
    }
  };

  const handleBackToHome = () => {
    navigate(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="w-full text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">HPLC 분석 프로토콜 선택</h1>
            <p className="text-sm sm:text-base text-gray-600">RT 기준을 입력하고 PDF 파일을 업로드하여 분석하세요.</p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border-0 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(hplcAnalysisTypes).map(([key, analysis]) => (
              <button
                key={key}
                onClick={() => setSelectedAnalysis(key)}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 text-left ${
                  selectedAnalysis === key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl'
                    : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                    {selectedAnalysis === key ? React.cloneElement(analysis.icon, { className: analysis.icon.props.className + " text-white" }) : analysis.icon}
                  </div>
                  <span className="font-bold text-sm sm:text-base leading-tight">{analysis.title}</span>
                </div>
                <p className="text-xs sm:text-sm opacity-80 leading-relaxed mb-2">{analysis.subtitle}</p>
                <div className="text-xs opacity-70">
                  {analysis.compounds.slice(0, 2).join(', ')}
                  {analysis.compounds.length > 2 && '...'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedAnalysis && (
            <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Card className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border-0 overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        {React.cloneElement(hplcAnalysisTypes[selectedAnalysis].icon, { className: hplcAnalysisTypes[selectedAnalysis].icon.props.className + " text-blue-600" })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-gray-900 text-lg sm:text-xl font-bold leading-tight">
                          {hplcAnalysisTypes[selectedAnalysis].title}
                        </CardTitle>
                        <p className="text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
                          {hplcAnalysisTypes[selectedAnalysis].subtitle}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleAnalyzeClick} className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 text-sm sm:text-base rounded-xl w-full sm:w-auto">
                      분석하기 <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="bg-white/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-0">
                    <h3 className="text-gray-900 font-semibold mb-4 text-sm sm:text-base">
                      분석 가능한 화합물
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {hplcAnalysisTypes[selectedAnalysis].compounds.map((compound, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-800 text-xs sm:text-sm font-medium">{compound}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}