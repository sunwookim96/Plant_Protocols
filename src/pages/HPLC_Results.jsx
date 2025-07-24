
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, BarChart3, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

import RTInput from "../components/hplc/RTInput";
import CalculationInput from "../components/hplc/CalculationInput";
import PDFUpload from "../components/hplc/PDFUpload";
import ResultsTable from "../components/hplc/ResultsTable";
import ResultsChart from "../components/hplc/ResultsChart";
import StatisticsResults from "../components/hplc/StatisticsResults";

export default function HPLC_Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState("");
  const [rtStandards, setRtStandards] = useState({});
  const [calculationParams, setCalculationParams] = useState({});
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("data_input");
  
  // useRef를 사용하여 탭 이동 시에도 파일 목록 유지
  const uploadedFilesRef = useRef([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("analysis_type");
    if (type) {
      setAnalysisType(type);
      const savedRT = localStorage.getItem(`rt_standards_${type}`);
      const savedCalc = localStorage.getItem(`calc_params_${type}`);
      const savedFiles = localStorage.getItem(`uploaded_files_${type}`);
      const savedResults = localStorage.getItem(`analysis_results_${type}`);
      
      if (savedRT) setRtStandards(JSON.parse(savedRT));
      if (savedCalc) setCalculationParams(JSON.parse(savedCalc));
      if (savedFiles) {
        const files = JSON.parse(savedFiles);
        uploadedFilesRef.current = files;
        setUploadedFiles(files);
      }
      if (savedResults) setResults(JSON.parse(savedResults));
    }
  }, [location.search]);

  const calculateConcentration = (sampleArea, compound, calcParams, analysisType) => {
    if (!sampleArea || !compound || !calcParams) return null;

    if (analysisType === 'phenol') {
      const a = calcParams[`${compound}_a`];
      const b = calcParams[`${compound}_b`];
      const sampleWeight = calcParams.sampleWeight;
      
      if (!a || !b || !sampleWeight) return null;
      
      // 수정된 계산식: µg/mL = (Area + b) / a, mg/g = µg/mL × 2 / 시료무게(g)
      const ugPerMl = (parseFloat(sampleArea) + parseFloat(b)) / parseFloat(a);
      const mgPerG = ugPerMl * 2 / parseFloat(sampleWeight);
      return mgPerG;
    } else {
      const { standardArea, molecularWeight, sampleWeight, conversionFactor } = calcParams;
      if (!standardArea || !molecularWeight || !sampleWeight) return null;
      
      const result = (parseFloat(sampleArea) / parseFloat(standardArea)) * 0.5 / parseFloat(molecularWeight) * 1000 / parseFloat(sampleWeight) * parseFloat(conversionFactor || 1);
      return result;
    }
  };

  const regenerateResults = (newCalcParams) => {
    const updatedResults = results.map(result => ({
      ...result,
      concentration: calculateConcentration(result.area, result.compound, newCalcParams, analysisType)
    }));
    setResults(updatedResults);
    localStorage.setItem(`analysis_results_${analysisType}`, JSON.stringify(updatedResults));
  };
  
  const handleRTStandardsChange = (standards) => {
    setRtStandards(standards);
    localStorage.setItem(`rt_standards_${analysisType}`, JSON.stringify(standards));
  };

  const handleCalculationParamsChange = (params) => {
    setCalculationParams(params);
    localStorage.setItem(`calc_params_${analysisType}`, JSON.stringify(params));
    if (results.length > 0) {
      regenerateResults(params);
    }
  };

  const handleBackToHPLC = () => navigate(createPageUrl("HPLC"));

  const handleResultsGenerated = (generatedResults) => {
    const calculatedResults = generatedResults.map(res => ({
      ...res,
      concentration: calculateConcentration(res.area, res.compound, calculationParams, analysisType)
    }));
    setResults(calculatedResults);
    localStorage.setItem(`analysis_results_${analysisType}`, JSON.stringify(calculatedResults));
  };

  const handleFilesUploaded = (newFiles, isReplacement = false) => {
    if (isReplacement) {
      // 덮어쓰기 모드 (파일 삭제 시)
      uploadedFilesRef.current = newFiles;
      setUploadedFiles(newFiles);
    } else {
      // 누적 모드 (새 파일 추가 시)
      const updatedFiles = [...uploadedFilesRef.current, ...newFiles];
      uploadedFilesRef.current = updatedFiles;
      setUploadedFiles(updatedFiles);
    }
    localStorage.setItem(`uploaded_files_${analysisType}`, JSON.stringify(uploadedFilesRef.current));
  };

  const getAnalysisTitle = () => {
    const titles = {
      phenol: "페놀 화합물 분석",
      glucosinolate: "글루코시놀레이트 분석",
      acacetin: "아카세틴 분석",
      rosmarinic_acid: "로즈마린산 분석",
      tilianin: "틸리아닌 분석"
    };
    return titles[analysisType] || "HPLC 분석";
  };

  if (!analysisType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">분석 항목을 선택해주세요</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">먼저 HPLC 분석에서 수행할 분석을 선택하세요.</p>
          <Button 
            onClick={handleBackToHPLC}
            className="bg-blue-600 hover:bg-blue-700 mt-6 rounded-xl flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>HPLC 분석으로 돌아가기</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{getAnalysisTitle()}</h1>
              <p className="text-sm sm:text-base text-gray-600">
                RT 기준을 입력하고 PDF 파일을 업로드하여 분석하세요.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button 
                onClick={handleBackToHPLC}
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 rounded-xl flex items-center space-x-2 h-10 sm:h-12"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>분석 선택</span>
              </Button>
            </div>
          </div>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-2 border-0 h-12 sm:h-14">
            <TabsTrigger 
              value="data_input" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 text-gray-600 rounded-lg sm:rounded-xl h-8 sm:h-10 font-semibold transition-all duration-200 text-xs sm:text-sm"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>데이터 입력 및 분석 결과</span>
            </TabsTrigger>
            <TabsTrigger 
              value="visualization" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 text-gray-600 rounded-lg sm:rounded-xl h-8 sm:h-10 font-semibold transition-all duration-200 text-xs sm:text-sm"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>시각화</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data_input" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RTInput 
                analysisType={analysisType}
                onRTStandardsChange={handleRTStandardsChange}
                initialValues={rtStandards}
              />
              <CalculationInput 
                analysisType={analysisType}
                onCalculationParamsChange={handleCalculationParamsChange}
                initialValues={calculationParams}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PDFUpload 
                  onFilesUploaded={handleFilesUploaded}
                  rtStandards={rtStandards}
                  onResultsGenerated={handleResultsGenerated}
                  analysisType={analysisType}
                  calculationParams={calculationParams}
                  uploadedFiles={uploadedFiles}
                />
              </div>
              <div className="lg:col-span-2">
                <StatisticsResults results={results} />
              </div>
            </div>
            {results.length > 0 && (
              <ResultsTable results={results} analysisType={analysisType} />
            )}
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6 sm:space-y-8">
            <ResultsChart results={results} analysisType={analysisType}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
