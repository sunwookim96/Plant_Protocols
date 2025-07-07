import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, Beaker, FlaskConical, Microscope, Calculator, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const analysisProtocols = {
  chlorophyll_a_b: {
    title: "엽록소 및 카로티노이드",
    subtitle: "Total Chlorophyll & Total Carotenoid",
    wavelengths: ["652.4", "665.2", "470"],
    protocol: [
      "2mL 튜브에 2mL의 90% MeOH과 시료 20mg 넣기",
      "20℃에서 중간 강도로 sonication 20분간 추출",
      "15,000RPM, 4℃, 10min 조건으로 원심분리",
      "상층액 1.5mL 추출 후 냉장보관",
      "96 well에 추출물 200μL 분주하여 흡광도 측정"
    ],
    formulas: [
      "Chl a (μg/ml) = 16.82 × A665.2 - 9.28 × A652.4",
      "Chl b (μg/ml) = 36.92 × A652.4 - 16.54 × A665.2", 
      "Carotenoid (μg/ml) = (1000 × A470 - 1.91 × Chl a - 95.15 × Chl b) / 225"
    ],
    unit: "μg/ml",
    icon: <TestTube className="h-5 w-5" />
  },
  total_phenol: {
    title: "총 페놀 함량",
    subtitle: "Total Phenolic Content",
    wavelengths: ["765"],
    protocol: [
      "엽록소 분석 후 남은 aliquot 100μL 사용",
      "Folin-Ciocalteu reagent 100μL + 증류수 1500μL 넣기",
      "5분간 방치 후 7.5% Na2CO3 용액 300μL 넣기",
      "40분간 상온에서 반응",
      "765nm에서 흡광도 측정"
    ],
    formulas: [
      "Gallic acid standard curve 사용하여 함량 계산",
      "농도 = (흡광도 - b) / a"
    ],
    unit: "mg GAE/g FW",
    icon: <Beaker className="h-5 w-5" />
  },
  total_flavonoid: {
    title: "총 플라보노이드",
    subtitle: "Total Flavonoid",
    wavelengths: ["415"],
    protocol: [
      "엽록소 분석 후 남은 aliquot 100μL 사용",
      "95% EtOH 300μL + 10% AlCl3 20μL 넣기",
      "1M potassium acetate 20μL + 증류수 600μL 넣기",
      "상온에서 40분간 반응",
      "415nm에서 흡광도 측정"
    ],
    formulas: [
      "Quercetin standard curve 사용하여 함량 계산",
      "농도 = (흡광도 - b) / a"
    ],
    unit: "mg QE/g FW",
    icon: <FlaskConical className="h-5 w-5" />
  },
  glucosinolate: {
    title: "글루코시놀레이트",
    subtitle: "Total Glucosinolate",
    wavelengths: ["425"],
    protocol: [
      "엽록소 분석 후 남은 aliquot 50μL 사용",
      "2mM sodium tetrachloropalladate 1.5mL 넣기",
      "증류수 150μL 넣기 후 혼합",
      "1시간 동안 상온에서 반응",
      "425nm에서 흡광도 측정"
    ],
    formulas: [
      "Total glucosinolate (μmol/g) = 1.40 + 118.86 × A425"
    ],
    unit: "μmol/g FW",
    icon: <Microscope className="h-5 w-5" />
  },
  dpph_scavenging: {
    title: "DPPH 라디칼 소거능",
    subtitle: "DPPH Radical Scavenging",
    wavelengths: ["517"],
    protocol: [
      "DPPH 용액: DPPH 200mg + 90% MeOH 50mL (호일로 포장 후 냉장보관)",
      "96-well plate에 90% MeOH 170μL + DPPH 용액 10μL + Sample 20μL 넣기",
      "Parafilm으로 밀봉 후 암조건에서 1시간 반응",
      "517nm에서 흡광도 측정"
    ],
    formulas: [
      "DPPH Inhibition (%) = ((Control - Sample) / Control) × 100%"
    ],
    unit: "% inhibition",
    icon: <Calculator className="h-5 w-5" />
  },
  anthocyanin: {
    title: "안토시아닌",
    subtitle: "Total Anthocyanin",
    wavelengths: ["530", "600"],
    protocol: [
      "2mL 튜브에 1% HCl (90% MeOH + 10% HCl) 2mL + 시료 20mg 넣기",
      "40℃에서 중간 강도로 sonication 1시간 추출",
      "15,000RPM, 4℃, 10min 조건으로 원심분리",
      "상층액 1.5mL 추출 후 냉장보관",
      "530nm, 600nm에서 흡광도 측정"
    ],
    formulas: [
      "Anthocyanin (mg/g) = (A530 - A600) × V × n × Mw / (ε × m)",
      "V = 추출부피(mL), n = 희석배수, Mw = 449.2, ε = 26900, m = 시료무게(g)"
    ],
    unit: "mg/g FW",
    icon: <TestTube className="h-5 w-5" />
  },
  cat: {
    title: "카탈라아제 활성",
    subtitle: "Catalase (CAT) Activity",
    wavelengths: ["240"],
    protocol: [
      "시료 20mg + pH 7.0 50mM PBS 2mL로 효소 추출",
      "액체질소 5분 + sonication 10분 (3회 반복)",
      "15,000RPM, 4℃, 10min 원심분리",
      "3% H₂O₂ 3.4μL + 50mM phosphate buffer 193.6μL + enzyme 3μL 넣기",
      "240nm에서 10초마다 10분간 흡광도 측정"
    ],
    formulas: [
      "CAT activity (μmol/min/mL) = (ΔA240/min) × total volume × 1000 / (39.4 × enzyme volume)",
      "CAT activity (μmol/min/mg DW) = unit/mL / enzyme (mg/mL)"
    ],
    unit: "μmol/min/mg DW",
    icon: <FlaskConical className="h-5 w-5" />
  },
  pod: {
    title: "퍼옥시다아제 활성",
    subtitle: "Peroxidase (POD) Activity", 
    wavelengths: ["470"],
    protocol: [
      "시료 20mg + pH 7.0 50mM PBS 2mL로 효소 추출",
      "액체질소 5분 + sonication 10분 (3회 반복)",
      "15,000RPM, 4℃, 10min 원심분리",
      "40mM phosphate buffer 66.6μL + 20mM guaiacol 80μL + 3% H₂O₂ 33.3μL + sample 20μL 넣기",
      "470nm에서 10초마다 흡광도 측정"
    ],
    formulas: [
      "POD activity (μmol/min/mL) = (ΔA470/min) × total volume × 1000 / (26.6 × enzyme volume)",
      "POD activity (μmol/min/mg DW) = unit/mL / enzyme (mg/mL)"
    ],
    unit: "μmol/min/mg DW",
    icon: <Beaker className="h-5 w-5" />
  },
  sod: {
    title: "슈퍼옥사이드 디스뮤타아제 활성",
    subtitle: "Superoxide Dismutase (SOD) Activity",
    wavelengths: ["560"],
    protocol: [
      "시료 20mg + pH 7.0 50mM PBS 2mL로 효소 추출",
      "50mM phosphate buffer 93.5μL + 0.1M methionine 52μL + 2.5mM NBT 24.5μL 넣기",
      "10mM EDTA 2μL + 0.5mM riboflavin 8μL 혼합",
      "PPFD 50 μmol/m²/s LED 광에 15분간 노출",
      "560nm에서 흡광도 측정"
    ],
    formulas: [
      "SOD inhibition (%) = ((Control - Sample) / Control) × 100%",
      "SOD activity (unit/mL) = (inhibition × total volume) / (50 × enzyme volume)",
      "SOD activity (unit/mg DW) = unit/mL / enzyme (mg/mL)"
    ],
    unit: "unit/mg DW",
    icon: <Microscope className="h-5 w-5" />
  },
  h2o2: {
    title: "과산화수소 함량",
    subtitle: "Hydrogen Peroxide (H₂O₂) Content",
    wavelengths: ["390"],
    protocol: [
      "시료 20mg + 0.1% TCA 2mL 혼합 후 vortex",
      "액체질소 5분 + sonication 10분 (3회 반복)",
      "15,000RPM, 4℃, 10min 원심분리",
      "상등액 1.5mL 추출",
      "10mM potassium phosphate buffer + 1M KI 사용하여 반응",
      "암실에서 10분 반응 후 390nm에서 측정"
    ],
    formulas: [
      "H₂O₂ standard curve 사용하여 함량 계산",
      "농도 = (흡광도 - b) / a"
    ],
    unit: "μmol/g FW",
    icon: <Calculator className="h-5 w-5" />
  }
};

export default function Analysis() {
  const [selectedAnalysis, setSelectedAnalysis] = useState("");
  const navigate = useNavigate();

  const handleAnalyzeClick = () => {
    if (selectedAnalysis) {
      navigate(createPageUrl(`Results?analysis_type=${selectedAnalysis}`));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">분석 프로토콜 선택</h1>
          <p className="text-gray-600">수행할 생화학 분석을 선택하세요.</p>
        </div>

        <div className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(analysisProtocols).map(([key, protocol]) => (
              <button
                key={key}
                onClick={() => setSelectedAnalysis(key)}
                className={`p-4 rounded-2xl border transition-all duration-300 text-left ${
                  selectedAnalysis === key
                    ? 'bg-blue-600 text-white border-blue-600 ios-shadow-lg'
                    : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 flex items-center justify-center">{protocol.icon}</div>
                  <span className="font-bold text-base">{protocol.title}</span>
                </div>
                <p className="text-sm opacity-80">{protocol.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedAnalysis && (
          <div className="space-y-8">
            <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                       {analysisProtocols[selectedAnalysis].icon}
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 text-xl font-bold">
                        {analysisProtocols[selectedAnalysis].title}
                      </CardTitle>
                      <p className="text-gray-600 text-base mt-1">
                        {analysisProtocols[selectedAnalysis].subtitle}
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleAnalyzeClick} className="ios-button h-12 text-base rounded-xl">
                    분석하기 <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                 <div className="ios-card bg-white/50 rounded-2xl p-6 border-0">
                  <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                    <TestTube className="h-4 w-4" />
                    <span>실험 프로토콜</span>
                  </h3>
                  <ol className="space-y-3">
                    {analysisProtocols[selectedAnalysis].protocol.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-6">
                    <div className="ios-card bg-white/50 rounded-2xl p-6 border-0">
                        <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                            <Calculator className="h-4 w-4" />
                            <span>계산 공식</span>
                        </h3>
                        <div className="space-y-4">
                            {analysisProtocols[selectedAnalysis].formulas.map((formula, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <code className="text-gray-800 text-sm font-mono leading-relaxed">
                                {formula}
                                </code>
                            </div>
                            ))}
                        </div>
                    </div>
                    <div className="ios-card bg-white/50 rounded-2xl p-6 border-0">
                        <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                            <Microscope className="h-4 w-4" />
                            <span>측정 파장</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysisProtocols[selectedAnalysis].wavelengths.map((wavelength) => (
                            <Badge key={wavelength} variant="default" className="bg-blue-600 hover:bg-blue-700 text-base">
                                {wavelength} nm
                            </Badge>
                            ))}
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}