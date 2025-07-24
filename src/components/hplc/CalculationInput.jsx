import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle } from "lucide-react";

const defaultPhenolCompounds = [
  "Arbutin", "Gallic acid", "Catechin hydrate", "4-Hydroxybenzoic acid", 
  "Chlorogenic acid", "Caffeic acid", "(-)-Epicatechin", "4-Hydroxy-3-benzoic acid",
  "p-Coumaric acid", "trans-Ferulic acid", "Benzoic acid", "Rutin",
  "trans-Cinnamic acid", "Quercetin", "Kaempferol"
];

const HighlightedValue = ({ value, placeholder }) => (
  <span className={`transition-colors duration-300 ${value ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
    {value || placeholder}
  </span>
);

export default function CalculationInput({ analysisType, onCalculationParamsChange, initialValues = {} }) {
  const [params, setParams] = useState({});
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    setParams(initialValues);
    setIsApplied(Object.keys(initialValues).length > 0 && Object.values(initialValues).some(v => v !== "" && v !== undefined));
  }, [initialValues]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setIsApplied(false);
  };

  const handleApply = () => {
    onCalculationParamsChange(params);
    setIsApplied(true);
  };

  if (analysisType === 'phenol') {
    return (
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>분석 변수 입력</span>
            </CardTitle>
            <Button 
              onClick={handleApply}
              className={`ios-button rounded-xl h-10 px-6 flex items-center space-x-2 ${
                isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isApplied && <CheckCircle className="h-4 w-4" />}
              <span>{isApplied ? "적용됨" : "적용"}</span>
            </Button>
          </div>
          <p className="text-gray-600 text-sm">각 화합물의 표준곡선 값(a, b)과 시료 무게를 입력하세요.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <Label className="text-gray-700 font-medium text-sm">시료 무게 (g)</Label>
            <Input
              type="number"
              step="any"
              placeholder="시료의 무게 (그램)"
              value={params.sampleWeight || ""}
              onChange={(e) => handleParamChange('sampleWeight', e.target.value)}
              className="ios-input border-0 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* 변수 입력 스크롤 영역 */}
          <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50/30">
            <h4 className="text-gray-800 font-semibold text-sm mb-2">변수 입력</h4>
            {defaultPhenolCompounds.map(compound => (
              <div key={compound} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h5 className="text-gray-800 font-semibold text-sm mb-3 truncate" title={compound}>{compound}</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-600 text-xs">기울기 (a)</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={params[`${compound}_a`] || ""}
                      onChange={(e) => handleParamChange(`${compound}_a`, e.target.value)}
                      className="ios-input border-0 text-gray-900 placeholder:text-gray-400 text-center h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">절편 (b)</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={params[`${compound}_b`] || ""}
                      onChange={(e) => handleParamChange(`${compound}_b`, e.target.value)}
                      className="ios-input border-0 text-gray-900 placeholder:text-gray-400 text-center h-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 적용된 변수 스크롤 영역 */}
          {isApplied && Object.keys(initialValues).length > 0 && (
            <div className="space-y-4 max-h-64 overflow-y-auto border border-blue-200 rounded-xl p-3 bg-blue-50/30">
              <h4 className="text-blue-800 font-semibold text-sm mb-2">적용된 변수</h4>
              <div className="mb-3 p-2 bg-blue-100 rounded-lg">
                <p className="text-blue-800 text-xs font-semibold">시료무게: {params.sampleWeight || '미입력'}g</p>
              </div>
              {defaultPhenolCompounds.map(compound => {
                const aValue = initialValues[`${compound}_a`];
                const bValue = initialValues[`${compound}_b`];
                if (aValue || bValue) {
                  return (
                    <div key={compound} className="p-3 bg-blue-100 rounded-xl border border-blue-300">
                      <h5 className="text-blue-800 font-semibold text-sm mb-2 truncate" title={compound}>{compound}</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-blue-700">a: </span>
                          <span className="font-bold text-blue-900">{aValue || '미입력'}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">b: </span>
                          <span className="font-bold text-blue-900">{bValue || '미입력'}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-gray-800 font-semibold mb-2">계산 공식</h4>
            <div className="text-gray-700 text-sm space-y-1 font-mono">
              <p>• µg/mL = (Area + b) / a</p>
              <p>• mg/g = µg/mL × 2 / <HighlightedValue value={params.sampleWeight} placeholder="시료무게 (g)"/></p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Other analysis types
  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>분석 변수 입력</span>
          </CardTitle>
          <Button 
            onClick={handleApply}
            className={`ios-button rounded-xl h-10 px-6 flex items-center space-x-2 ${
              isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isApplied && <CheckCircle className="h-4 w-4" />}
            <span>{isApplied ? "적용됨" : "적용"}</span>
          </Button>
        </div>
        <p className="text-gray-600 text-sm">계산에 필요한 변수들을 입력하세요.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700 font-medium text-sm">표준 Area</Label>
            <Input type="number" step="any" placeholder="표준 화합물의 Area 값" value={params.standardArea || ""} onChange={(e) => handleParamChange('standardArea', e.target.value)} className="ios-input border-0 text-gray-900 placeholder:text-gray-400"/>
          </div>
          <div>
            <Label className="text-gray-700 font-medium text-sm">분자량 (MW)</Label>
            <Input type="number" step="any" placeholder="화합물의 분자량" value={params.molecularWeight || ""} onChange={(e) => handleParamChange('molecularWeight', e.target.value)} className="ios-input border-0 text-gray-900 placeholder:text-gray-400"/>
          </div>
          <div>
            <Label className="text-gray-700 font-medium text-sm">시료 무게 (g)</Label>
            <Input type="number" step="any" placeholder="시료의 무게 (그램)" value={params.sampleWeight || ""} onChange={(e) => handleParamChange('sampleWeight', e.target.value)} className="ios-input border-0 text-gray-900 placeholder:text-gray-400"/>
          </div>
          <div>
            <Label className="text-gray-700 font-medium text-sm">환산계수 (고정값)</Label>
            <Input type="number" value={params.conversionFactor || "1"} onChange={(e) => handleParamChange('conversionFactor', e.target.value)} className="ios-input border-0 text-gray-900 placeholder:text-gray-400"/>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-gray-800 font-semibold mb-2">계산 공식</h4>
          <p className="text-gray-700 text-sm font-mono break-words leading-relaxed">
            µmol/g dry wt. = (<HighlightedValue value={params.standardArea} placeholder="샘플 Area"/> / <HighlightedValue value={params.standardArea} placeholder="표준 Area"/>) × 0.5 / <HighlightedValue value={params.molecularWeight} placeholder="MW"/> × 1000 / <HighlightedValue value={params.sampleWeight} placeholder="시료무게"/> × <HighlightedValue value={params.conversionFactor || "1"} placeholder="환산계수"/>
          </p>
          {isApplied && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-xs font-semibold">
                적용된 변수: 표준Area={params.standardArea || '미입력'}, MW={params.molecularWeight || '미입력'}, 시료무게={params.sampleWeight || '미입력'}g, 환산계수={params.conversionFactor || '1'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}