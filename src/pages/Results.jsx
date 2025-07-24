
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, BarChart3, Database, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

import ManualInput from "../components/analysis/ManualInput";
import ExcelUpload from "../components/analysis/ExcelUpload";
import CalculationEngine from "../components/analysis/CalculationEngine";
import ChartVisualization from "../components/analysis/ChartVisualization";
import SampleResults from "../components/analysis/SampleResults";
import CalculationParams from "../components/analysis/CalculationParams";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState("");
  const [samples, setSamples] = useState([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("data_input_analysis");
  const [calculationParams, setCalculationParams] = useState({});

  // URL 파라미터에서 탭 상태 확인 및 설정
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(location.search);
    params.set("tab", newTab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // 계산 변수 localStorage에 저장/불러오기
  const saveCalculationParams = (params) => {
    try {
      localStorage.setItem(`calc_params_${analysisType}`, JSON.stringify(params));
    } catch (error) {
      console.error("Error saving calculation parameters:", error);
    }
  };

  const loadCalculationParams = () => {
    try {
      const saved = localStorage.getItem(`calc_params_${analysisType}`);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading calculation parameters:", error);
      return {};
    }
  };

  // Get samples from localStorage
  const getSamplesFromStorage = (type) => {
    try {
      const allSamples = JSON.parse(localStorage.getItem("phyto_samples") || "[]");
      return allSamples.filter(s => s.analysis_type === type);
    } catch (error) {
      console.error("Error loading samples from localStorage:", error);
      return [];
    }
  };

  // Save samples to localStorage
  const saveSamplesToStorage = (newSamples) => {
    try {
      const allSamples = JSON.parse(localStorage.getItem("phyto_samples") || "[]");
      const otherSamples = allSamples.filter(s => s.analysis_type !== analysisType);
      localStorage.setItem("phyto_samples", JSON.stringify([...otherSamples, ...newSamples]));
    } catch (error) {
      console.error("Error saving samples to localStorage:", error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("analysis_type");
    if (type) {
      setAnalysisType(type);
      setSamples(getSamplesFromStorage(type));
      // 저장된 계산 변수 불러오기
      const savedParams = loadCalculationParams();
      setCalculationParams(savedParams);
    }
  }, [location.search, analysisType]); // Added analysisType to dependencies for reload on type change

  const handleBackToAnalysis = () => {
    navigate(createPageUrl("Analysis"));
  };
  
  const loadSamples = () => {
    setSamples(getSamplesFromStorage(analysisType));
  };

  // 계산 변수 변경 시 저장
  const handleCalculationParamsChange = (params) => {
    setCalculationParams(params);
    saveCalculationParams(params);
  };

  const handleAddOrUpdateSample = (sampleData, isEditing) => {
    const currentSamples = getSamplesFromStorage(analysisType);
    let updatedSamples;
    if (isEditing) {
      updatedSamples = currentSamples.map(s => s.id === sampleData.id ? {...s, ...sampleData, updated_date: new Date().toISOString()} : s);
    } else {
      updatedSamples = [...currentSamples, { ...sampleData, id: Date.now().toString(), created_date: new Date().toISOString(), analysis_type: analysisType }];
    }
    saveSamplesToStorage(updatedSamples);
    loadSamples();
  };

  const handleRemoveSample = (sampleId) => {
    const currentSamples = getSamplesFromStorage(analysisType);
    const updatedSamples = currentSamples.filter(s => s.id !== sampleId);
    saveSamplesToStorage(updatedSamples);
    loadSamples();
    setSelectedSampleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sampleId);
        return newSet;
    });
  };

  const handleRemoveMultipleSamples = (sampleIds) => {
    const currentSamples = getSamplesFromStorage(analysisType);
    const updatedSamples = currentSamples.filter(s => !sampleIds.includes(s.id));
    saveSamplesToStorage(updatedSamples);
    loadSamples();
    setSelectedSampleIds(new Set());
  };

  const handleSamplesUploaded = (uploadedSamples) => {
    const newSamples = uploadedSamples.map(s => ({ 
        ...s, 
        id: `${Date.now()}-${Math.random()}`, 
        created_date: new Date().toISOString(),
        analysis_type: analysisType 
    }));
    const currentSamples = getSamplesFromStorage(analysisType);
    saveSamplesToStorage([...currentSamples, ...newSamples]);
    loadSamples();
  };

  const calculateSingleResult = (sample) => {
    const p = calculationParams;
    const values = sample.absorbance_values;
    
    switch (sample.analysis_type) {
        case "chlorophyll_a_b": {
            const a665 = values["665.2"] || 0;
            const a652 = values["652.4"] || 0;
            const a470 = values["470"] || 0;
            
            const chl_a = 16.82 * a665 - 9.28 * a652;
            const chl_b = 36.92 * a652 - 16.54 * a665;
            const carotenoid = (1000 * a470 - 1.91 * chl_a - 95.15 * chl_b) / 225;
            
            return { 
                result: chl_a, // 기본 표시값은 엽록소 a
                unit: "μg/mL",
                chl_a: chl_a,
                chl_b: chl_b,
                carotenoid: carotenoid
            };
        }
        case "carotenoid": {
            const a470 = values["470"] || 0;
            const a665 = values["665.2"] || 0;
            const a652 = values["652.4"] || 0;
            const chl_a = 16.82 * a665 - 9.28 * a652;
            const chl_b = 36.92 * a652 - 16.54 * a665;
            return { result: (1000 * a470 - 1.91 * chl_a - 95.15 * chl_b) / 225, unit: "μg/mL" };
        }
        case "total_phenol":
        case "total_flavonoid": {
            if (!p.std_a || !p.std_b) return { result: 0, unit: "N/A" };
            const y = values[Object.keys(values)[0]] || 0; // Assumes a single absorbance value
            const result = (y - parseFloat(p.std_b)) / parseFloat(p.std_a);
            const unitMap = { total_phenol: "mg GAE/g DW", total_flavonoid: "mg QE/g DW" };
            return { result, unit: unitMap[sample.analysis_type] };
        }
        case "h2o2": {
            if (!p.std_a || !p.std_b) return { result: 0, unit: "N/A" };
            const y = values[Object.keys(values)[0]] || 0;
            const result = (y - parseFloat(p.std_b)) / parseFloat(p.std_a);
            return { result, unit: "μmol/g DW" };
        }
        case "glucosinolate":
            return { result: 1.40 + 118.86 * (values["425"] || 0), unit: "μmol/g DW" };
        case "dpph_scavenging": {
            if (!p.dpph_control) return { result: 0, unit: "% inhibition" };
            const control = parseFloat(p.dpph_control);
            return { result: ((control - (values["517"] || 0)) / control) * 100, unit: "% inhibition" };
        }
        case "anthocyanin": {
            const { V = 2, n = 1, Mw = 449.2, epsilon = 26900, m = 0.02 } = p.anthocyanin || {};
            const a530 = values["530"] || 0;
            const a600 = values["600"] || 0;
            const result = (a530 - a600) * parseFloat(V) * parseFloat(n) * parseFloat(Mw) / (parseFloat(epsilon) * parseFloat(m));
            return { result, unit: "mg/g DW" };
        }
        case "cat": {
            const { delta_A, total_vol, enzyme_vol, enzyme_conc } = p.cat || {};
            if (!delta_A || !total_vol || !enzyme_vol || !enzyme_conc) return { result: 0, unit: "μmol/min/mg DW" };
            const activity_per_ml = (parseFloat(delta_A) * parseFloat(total_vol) * 1000) / (39.4 * parseFloat(enzyme_vol));
            return { result: activity_per_ml / parseFloat(enzyme_conc), unit: "μmol/min/mg DW" };
        }
        case "pod": {
             const { delta_A, total_vol, enzyme_vol, enzyme_conc } = p.pod || {};
            if (!delta_A || !total_vol || !enzyme_vol || !enzyme_conc) return { result: 0, unit: "μmol/min/mg DW" };
            const activity_per_ml = (parseFloat(delta_A) * parseFloat(total_vol) * 1000) / (26.6 * parseFloat(enzyme_vol));
            return { result: activity_per_ml / parseFloat(enzyme_conc), unit: "μmol/min/mg DW" };
        }
        case "sod": {
            const { control_abs, enzyme_vol, enzyme_conc, total_vol } = p.sod || {};
            if (!control_abs || !enzyme_vol || !enzyme_conc || !total_vol) return { result: 0, unit: "unit/mg DW" };
            const sample_abs = values["560"] || 0;
            const inhibition = ((parseFloat(control_abs) - sample_abs) / parseFloat(control_abs)) * 100;
            const activity_per_ml = (inhibition * parseFloat(total_vol)) / (50 * parseFloat(enzyme_vol));
            return { result: activity_per_ml / parseFloat(enzyme_conc), unit: "unit/mg DW" };
        }
        default:
            return { result: 0, unit: "N/A" };
    }
  };
  
  const allCalculatedSamples = samples
    .map(sample => ({
      ...sample,
      ...calculateSingleResult(sample)
    }));

  const selectedSamples = allCalculatedSamples.filter(s => selectedSampleIds.has(s.id));

  // 샘플을 처리구별로 그룹화하고 정렬
  const groupedAndSortedSamples = useMemo(() => {
    const grouped = _.groupBy(allCalculatedSamples, 'treatment_name');
    const sortedGroups = Object.keys(grouped).sort();
    return sortedGroups.flatMap(groupName => 
      _.sortBy(grouped[groupName], ['replicate', 'sample_name']) // Sort by replicate then sample_name
    );
  }, [allCalculatedSamples]);

  const getAnalysisTitle = () => {
    const titles = {
      chlorophyll_a_b: "엽록소 및 카로티노이드 분석",
      total_phenol: "총 페놀 함량 분석",
      total_flavonoid: "총 플라보노이드 분석",
      glucosinolate: "글루코시놀레이트 분석",
      dpph_scavenging: "DPPH 라디칼 소거능 분석",
      anthocyanin: "안토시아닌 분석",
      cat: "카탈라아제 활성 분석",
      pod: "퍼옥시다아제 활성 분석",
      sod: "슈퍼옥사이드 디스뮤타아제 활성 분석",
      h2o2: "과산화수소 함량 분석"
    };
    return titles[analysisType] || "분석";
  };

  const getTemplateHeaders = (type) => {
    const commonHeaders = ["Sample Name", "Description", "Treatment Name", "Replicate"];
    const typeSpecificAbsorbanceHeaders = {
        chlorophyll_a_b: ["665.2", "652.4", "470"], // Added 470 for carotenoid in combined template
        carotenoid: ["470", "665.2", "652.4"],
        total_phenol: ["Absorbance"], // For single absorbance inputs for standard curves
        total_flavonoid: ["Absorbance"],
        h2o2: ["Absorbance"],
        glucosinolate: ["425"],
        dpph_scavenging: ["517"],
        anthocyanin: ["530", "600"],
        sod: ["560"],
        // For 'cat' and 'pod', the 'delta_A' value is taken from `calculationParams`,
        // not `sample.absorbance_values`, so no specific absorbance columns are needed
        // in the sample input template according to the current calculation logic.
    };

    return [...commonHeaders, ...(typeSpecificAbsorbanceHeaders[type] || [])];
  };

  const handleDownloadTemplate = () => {
      if (!analysisType) {
          alert("먼저 분석 항목을 선택해주세요.");
          return;
      }

      const headers = getTemplateHeaders(analysisType);
      if (headers.length <= 4) { // Only common headers (Sample Name, Description, Treatment Name, Replicate)
          alert("이 분석 항목에 대한 특정 흡광도 템플릿이 없습니다. '샘플 이름', '설명', '처리구', '반복' 열만 제공됩니다.");
      }

      let csvContent = headers.map(header => `"${header}"`).join(",") + "\n";
      // Add a few example rows
      for (let i = 1; i <= 3; i++) {
          const exampleRow = headers.map(header => {
              if (header === "Sample Name") return `"Sample ${i}"`;
              if (header === "Description") return `"Description for Sample ${i}"`;
              if (header === "Treatment Name") return `"Control"`; 
              if (header === "Replicate") return `""`; // Leave empty for user to fill
              // For absorbance values, provide placeholder 0.000
              return `"0.000"`;
          }).join(",");
          csvContent += exampleRow + "\n";
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `${analysisType}_template.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          alert("파일을 직접 다운로드하는 기능은 귀하의 브라우저에서 지원되지 않습니다.");
      }
  };


  if (!analysisType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-20">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">분석 항목을 선택해주세요</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">먼저 분석 프로토콜에서 수행할 분석을 선택하세요.</p>
            <Button 
              onClick={handleBackToAnalysis}
              className="bg-blue-600 hover:bg-blue-700 mt-6 rounded-xl flex items-center space-x-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>분석 프로토콜로 돌아가기</span>
            </Button>
          </div>
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
          className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div className="text-left sm:text-center flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{getAnalysisTitle()}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              데이터를 입력하고 분석 결과를 확인하세요.
            </p>
          </div>
          <Button 
            onClick={handleBackToAnalysis}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100 rounded-xl flex items-center space-x-2 h-10 sm:h-12 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>분석 선택</span>
          </Button>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-2 border-0 h-12 sm:h-14">
            <TabsTrigger 
              value="data_input_analysis" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 text-gray-600 rounded-lg sm:rounded-xl h-8 sm:h-10 font-semibold transition-all duration-200 text-xs sm:text-sm"
            >
              <Database className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">데이터 입력 및 분석 결과</span>
              <span className="sm:hidden">데이터 분석</span>
            </TabsTrigger>
            <TabsTrigger 
              value="visualization" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 text-gray-600 rounded-lg sm:rounded-xl h-8 sm:h-10 font-semibold transition-all duration-200 text-xs sm:text-sm"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>시각화</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data_input_analysis" className="space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CalculationParams 
                analysisType={analysisType} 
                onParamsChange={handleCalculationParamsChange}
                initialParams={calculationParams}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start"
            >
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-2 border-0 h-10 sm:h-12 w-full">
                    <TabsTrigger value="manual" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-blue-600 rounded-lg sm:rounded-xl font-semibold h-6 sm:h-8 transition-all duration-200 text-xs sm:text-sm flex-1">
                      직접 입력
                    </TabsTrigger>
                    <TabsTrigger value="excel" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-gray-600 data-[state=active]:text-blue-600 rounded-lg sm:rounded-xl font-semibold h-6 sm:h-8 transition-all duration-200 text-xs sm:text-sm flex-1">
                      파일 업로드
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="manual" className="mt-4 sm:mt-6">
                    <ManualInput 
                      analysisType={analysisType}
                      onSaveSample={handleAddOrUpdateSample}
                    />
                  </TabsContent>
                  <TabsContent value="excel" className="mt-4 sm:mt-6">
                      <ExcelUpload 
                        analysisType={analysisType}
                        onSamplesUploaded={handleSamplesUploaded}
                        onDownloadTemplate={handleDownloadTemplate}
                      />
                  </TabsContent>
                </Tabs>
                <CalculationEngine samples={selectedSamples} />
              </div>
              <div className="lg:col-span-3">
                <SampleResults
                  samples={groupedAndSortedSamples}
                  selectedIds={selectedSampleIds}
                  onSelectionChange={setSelectedSampleIds}
                  onEdit={handleAddOrUpdateSample}
                  onRemove={handleRemoveSample}
                  onRemoveMultiple={handleRemoveMultipleSamples}
                  analysisType={analysisType}
                />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="visualization">
            <motion.div
              key="visualization"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ChartVisualization samples={allCalculatedSamples} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
