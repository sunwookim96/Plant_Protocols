import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FlaskConical } from "lucide-react";

const analysisTypes = [
  { value: "chlorophyll_a_b", label: "총 엽록소 & 카로티노이드", subtitle: "Total Chlorophyll & Carotenoid" },
  { value: "total_phenol", label: "총 페놀 함량", subtitle: "Total Phenolic Content" },
  { value: "total_flavonoid", label: "총 플라보노이드", subtitle: "Total Flavonoid" },
  { value: "glucosinolate", label: "총 글루코시놀레이트", subtitle: "Total Glucosinolate" },
  { value: "dpph_scavenging", label: "DPPH 라디칼 소거능", subtitle: "DPPH Radical Scavenging" },
  { value: "anthocyanin", label: "총 안토시아닌", subtitle: "Total Anthocyanin" },
  { value: "cat", label: "카탈라아제 활성", subtitle: "Catalase (CAT) Activity" },
  { value: "pod", label: "퍼옥시다아제 활성", subtitle: "Peroxidase (POD) Activity" },
  { value: "sod", label: "슈퍼옥사이드 디스뮤타아제 활성", subtitle: "Superoxide Dismutase (SOD) Activity" },
  { value: "h2o2", label: "과산화수소 함량", subtitle: "Hydrogen Peroxide (H₂O₂) Content" }
];

export default function AnalysisSelector({ selectedAnalysis, onAnalysisChange }) {
  return (
    <div className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 p-6">
      <Label htmlFor="analysis-type" className="text-gray-900 font-semibold text-lg mb-4 block">
          분석 항목 선택
      </Label>
      <Select value={selectedAnalysis} onValueChange={onAnalysisChange}>
        <SelectTrigger className="ios-input border-0 text-gray-900 placeholder:text-gray-500 h-14 text-base font-medium">
          <SelectValue placeholder="분석할 항목을 선택하세요" />
        </SelectTrigger>
        <SelectContent className="ios-blur bg-white/95 border border-gray-200/80 rounded-2xl ios-shadow-lg p-2">
          {analysisTypes.map((type) => (
            <SelectItem 
              key={type.value} 
              value={type.value}
              className="py-3 px-4 rounded-xl mx-1 my-1 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white focus:bg-blue-100 transition-colors"
            >
              <div>
                <span className="font-bold text-base">
                  {type.label.replace("H2O2", "H₂O₂")}
                </span>
                <span className="text-sm ml-2 opacity-80">{type.subtitle.replace("H2O2", "H₂O₂")}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}