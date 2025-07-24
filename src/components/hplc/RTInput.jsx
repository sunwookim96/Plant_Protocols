import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle } from "lucide-react";

const defaultCompounds = {
  phenol: [
    "Arbutin", "Gallic acid", "Catechin hydrate", "4-Hydroxybenzoic acid", 
    "Chlorogenic acid", "Caffeic acid", "(-)-Epicatechin", "4-Hydroxy-3-benzoic acid",
    "p-Coumaric acid", "trans-Ferulic acid", "Benzoic acid", "Rutin",
    "trans-Cinnamic acid", "Quercetin", "Kaempferol"
  ],
  glucosinolate: [
    "Progoitrin", "Sinigrin", "Glucoalyssin", "Gluconapoleiferin",
    "Gluconapin", "4-Hydroxyglucobrassicin", "Glucobrassicanapin", "Glucoerucin",
    "Glucobrassicin", "4-Methoxyglucobrassicin", "Gluconasturtiin", "Neoglucobrassicin"
  ],
  acacetin: ["Acacetin", "Acacetin-7-O-glucoside"],
  rosmarinic_acid: ["Rosmarinic acid", "Caffeic acid", "Salvianolic acid B"],
  tilianin: ["Tilianin", "Acacetin-7-O-rutinoside"]
};

const getShortName = (compoundName) => {
  const shortNames = {
    "4-Hydroxybenzoic acid": "4-Hydroxybenzoic",
    "(-)-Epicatechin": "Epicatechin",
    "4-Hydroxy-3-benzoic acid": "4-Hydroxy-3-benzoic",
    "p-Coumaric acid": "p-Coumaric",
    "trans-Ferulic acid": "trans-Ferulic",
    "trans-Cinnamic acid": "trans-Cinnamic",
    "4-Hydroxyglucobrassicin": "4-Hydroxygluco",
    "Glucobrassicanapin": "Glucobrassican",
    "4-Methoxyglucobrassicin": "4-Methoxygluco",
    "Acacetin-7-O-glucoside": "Acacetin-7-O-gluco",
    "Acacetin-7-O-rutinoside": "Acacetin-7-O-ruti"
  };
  return shortNames[compoundName] || compoundName;
};

export default function RTInput({ analysisType, onRTStandardsChange, initialValues = {} }) {
  const [compounds, setCompounds] = useState([]);
  const [rtValues, setRtValues] = useState({});
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (analysisType && defaultCompounds[analysisType]) {
      const defaultList = defaultCompounds[analysisType];
      setCompounds(defaultList);
      
      const initialRTValues = {};
      defaultList.forEach(compound => {
        initialRTValues[compound] = initialValues[compound] || "";
      });
      setRtValues(initialRTValues);
      
      setIsApplied(Object.keys(initialValues).length > 0 && Object.values(initialValues).some(v => v !== ""));
    }
  }, [analysisType, initialValues]);

  const handleRTChange = (compound, value) => {
    setRtValues(prev => ({ ...prev, [compound]: value }));
    setIsApplied(false);
  };

  const handleApply = () => {
    const validRTValues = {};
    Object.entries(rtValues).forEach(([comp, rt]) => {
      if (rt && !isNaN(parseFloat(rt))) {
        validRTValues[comp] = parseFloat(rt);
      }
    });
    onRTStandardsChange(validRTValues);
    setIsApplied(true);
  };

  const getCompoundsByColumns = () => {
    const compoundsArray = [...compounds];
    const columnSize = Math.ceil(compoundsArray.length / 3);
    return [
      compoundsArray.slice(0, columnSize),
      compoundsArray.slice(columnSize, columnSize * 2),
      compoundsArray.slice(columnSize * 2)
    ];
  };

  const compoundColumns = getCompoundsByColumns();

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>RT 기준 입력</span>
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
        <p className="text-gray-600 text-sm">각 화합물의 기준 Retention Time을 입력하세요.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-x-4 gap-y-4">
          {compoundColumns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {column.map((compound) => (
                <div key={compound} className="bg-white rounded-lg p-3 border border-gray-200">
                  <Label htmlFor={compound} className="text-gray-700 font-medium text-xs mb-2 block" title={compound}>
                    {getShortName(compound)}
                  </Label>
                  <Input
                    id={compound}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={rtValues[compound] || ""}
                    onChange={(e) => handleRTChange(compound, e.target.value)}
                    className="ios-input border-0 text-gray-900 placeholder:text-gray-400 text-center h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {isApplied && Object.keys(initialValues).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-blue-800 font-semibold mb-3">적용된 RT</h4>
            <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-xs text-blue-900 font-mono">
              {Object.entries(initialValues).map(([compound, rt]) => (
                <div key={compound} className="bg-blue-100 rounded p-2 text-center">
                  <div className="text-blue-700 font-medium mb-1" title={compound}>
                    {getShortName(compound)}
                  </div>
                  <div className="font-bold text-blue-900">{parseFloat(rt).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}