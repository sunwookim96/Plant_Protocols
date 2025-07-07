
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const ParamInput = ({ label, value, onChange, placeholder, type = "number" }) => (
  <div>
    <Label className="text-gray-600 text-sm">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="ios-input border-0 text-gray-900 placeholder:text-gray-400"
    />
  </div>
);

const HighlightedValue = ({ value, placeholder }) => (
  <span className={`transition-colors duration-300 ${value ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
    {value || placeholder}
  </span>
);

export default function CalculationParams({ analysisType, onParamsChange }) {
  const [params, setParams] = useState({});
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    setParams({});
    setIsApplied(false);
  }, [analysisType]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setIsApplied(false);
  };

  const handleNestedParamChange = (group, key, value) => {
    setParams(prev => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [key]: value
      }
    }));
    setIsApplied(false);
  };

  const handleApply = () => {
    onParamsChange(params);
    setIsApplied(true);
  };

  const renderParams = () => {
    switch (analysisType) {
      case "total_phenol":
      case "total_flavonoid":
      case "h2o2":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <ParamInput label="기울기 (a)" value={params.std_a || ""} onChange={e => handleParamChange('std_a', e.target.value)} placeholder="Standard curve's slope" />
            <ParamInput label="Y절편 (b)" value={params.std_b || ""} onChange={e => handleParamChange('std_b', e.target.value)} placeholder="Standard curve's y-intercept" />
            <div className="flex items-center space-x-4">
              <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center flex-1">
                 y = <HighlightedValue value={params.std_a} placeholder="a" />x + (<HighlightedValue value={params.std_b} placeholder="b" />)
              </p>
              <Button onClick={handleApply} className="ios-button rounded-xl h-12">
                {isApplied ? <CheckCircle className="h-4 w-4" /> : "적용"}
              </Button>
            </div>
          </div>
        );
      case "dpph_scavenging":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <ParamInput label="Control 흡광도" value={params.dpph_control || ""} onChange={e => handleParamChange('dpph_control', e.target.value)} placeholder="Absorbance of control" />
            <div className="col-span-2 flex items-center space-x-4">
               <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center flex-1">
                 Inhibition (%) = ((<HighlightedValue value={params.dpph_control} placeholder="Control" /> - Sample) / <HighlightedValue value={params.dpph_control} placeholder="Control" />) * 100
               </p>
              <Button onClick={handleApply} className="ios-button rounded-xl h-12">
                {isApplied ? <CheckCircle className="h-4 w-4" /> : "적용"}
              </Button>
            </div>
          </div>
        );
      case "anthocyanin":
        return (
           <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4">
              <ParamInput label="추출 부피 (V, mL)" value={params.anthocyanin?.V || ""} onChange={e => handleNestedParamChange('anthocyanin', 'V', e.target.value)} placeholder="Default: 2" />
              <ParamInput label="희석 배수 (n)" value={params.anthocyanin?.n || ""} onChange={e => handleNestedParamChange('anthocyanin', 'n', e.target.value)} placeholder="Default: 1" />
              <ParamInput label="분자량 (Mw)" value={params.anthocyanin?.Mw || ""} onChange={e => handleNestedParamChange('anthocyanin', 'Mw', e.target.value)} placeholder="Default: 449.2" />
              <ParamInput label="Molar absorptivity (ε)" value={params.anthocyanin?.epsilon || ""} onChange={e => handleNestedParamChange('anthocyanin', 'epsilon', e.target.value)} placeholder="Default: 26900" />
              <ParamInput label="시료 무게 (m, g)" value={params.anthocyanin?.m || ""} onChange={e => handleNestedParamChange('anthocyanin', 'm', e.target.value)} placeholder="Default: 0.02" />
            </div>
            <div className="flex items-center space-x-4">
                <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center text-sm flex-1">
                  Anthocyanin = (A530 - A600) × <HighlightedValue value={params.anthocyanin?.V} placeholder="V" /> × <HighlightedValue value={params.anthocyanin?.n} placeholder="n" /> × <HighlightedValue value={params.anthocyanin?.Mw} placeholder="Mw" /> / (<HighlightedValue value={params.anthocyanin?.epsilon} placeholder="ε" /> × <HighlightedValue value={params.anthocyanin?.m} placeholder="m" />)
                </p>
                <Button onClick={handleApply} className="ios-button rounded-xl h-12">
                  {isApplied ? <CheckCircle className="h-4 w-4" /> : "적용"}
                </Button>
            </div>
           </div>
        );
       case "pod":
       case "cat":
       case "sod":
         const enzyme = analysisType;
         const commonParams = (
            <>
                <ParamInput label="ΔA/min" value={params[enzyme]?.delta_A || ""} onChange={e => handleNestedParamChange(enzyme, 'delta_A', e.target.value)} placeholder="Change in absorbance per minute" />
                <ParamInput label="Total Volume (μL)" value={params[enzyme]?.total_vol || ""} onChange={e => handleNestedParamChange(enzyme, 'total_vol', e.target.value)} placeholder="e.g., 200" />
                <ParamInput label="Enzyme Volume (μL)" value={params[enzyme]?.enzyme_vol || ""} onChange={e => handleNestedParamChange(enzyme, 'enzyme_vol', e.target.value)} placeholder="e.g., 20" />
                <ParamInput label="Enzyme Conc. (mg/mL)" value={params[enzyme]?.enzyme_conc || ""} onChange={e => handleNestedParamChange(enzyme, 'enzyme_conc', e.target.value)} placeholder="Enzyme concentration" />
            </>
         );
         if (enzyme === 'sod') {
             return (
                 <div className="flex flex-col space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <ParamInput label="Control Absorbance" value={params.sod?.control_abs || ""} onChange={e => handleNestedParamChange('sod', 'control_abs', e.target.value)} placeholder="Absorbance of control" />
                      <ParamInput label="Total Volume (μL)" value={params.sod?.total_vol || ""} onChange={e => handleNestedParamChange('sod', 'total_vol', e.target.value)} placeholder="e.g., 200" />
                      <ParamInput label="Enzyme Volume (μL)" value={params.sod?.enzyme_vol || ""} onChange={e => handleNestedParamChange('sod', 'enzyme_vol', e.target.value)} placeholder="e.g., 20" />
                      <ParamInput label="Enzyme Conc. (mg/mL)" value={params.sod?.enzyme_conc || ""} onChange={e => handleNestedParamChange('sod', 'enzyme_conc', e.target.value)} placeholder="Enzyme concentration" />
                    </div>
                     <div className="flex items-center space-x-4">
                        <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center text-sm flex-1">
                           SOD activity = (inhibition% × <HighlightedValue value={params.sod?.total_vol} placeholder="total_vol"/>) / (50 × <HighlightedValue value={params.sod?.enzyme_vol} placeholder="enzyme_vol"/>) / <HighlightedValue value={params.sod?.enzyme_conc} placeholder="enzyme_conc"/>
                        </p>
                        <Button onClick={handleApply} className="ios-button rounded-xl h-12">
                          {isApplied ? <CheckCircle className="h-4 w-4" /> : "적용"}
                        </Button>
                    </div>
                 </div>
             )
         }
         return (
           <div className="flex flex-col space-y-4">
             <div className="flex flex-wrap gap-4">
              {commonParams}
             </div>
             <div className="flex items-center space-x-4">
                <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center text-sm flex-1">
                  {enzyme.toUpperCase()} activity = (<HighlightedValue value={params[enzyme]?.delta_A} placeholder="ΔA"/> × <HighlightedValue value={params[enzyme]?.total_vol} placeholder="total_vol"/> × 1000) / ({enzyme === 'cat' ? '39.4' : '26.6'} × <HighlightedValue value={params[enzyme]?.enzyme_vol} placeholder="enzyme_vol"/>) / <HighlightedValue value={params[enzyme]?.enzyme_conc} placeholder="enzyme_conc"/>
                </p>
                <Button onClick={handleApply} className="ios-button rounded-xl h-12">
                  {isApplied ? <CheckCircle className="h-4 w-4" /> : "적용"}
                </Button>
            </div>
           </div>
         );
      default:
        return null;
    }
  };

  const renderedParams = renderParams();
  if (!renderedParams) return null;

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 text-xl font-semibold">
          <Calculator className="h-5 w-5" />
          <span>계산 변수 입력</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderedParams}
      </CardContent>
    </Card>
  );
}
