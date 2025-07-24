
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const getWavelengthsForAnalysis = (analysisType) => {
  const wavelengths = {
    chlorophyll_a_b: ["665.2", "652.4", "470"],
    carotenoid: ["470", "665.2", "652.4"],
    total_phenol: ["765"],
    total_flavonoid: ["415"],
    glucosinolate: ["425"],
    dpph_scavenging: ["517"],
    anthocyanin: ["530", "600"],
    cat: ["240"],
    pod: ["470"],
    sod: ["560"],
    h2o2: ["390"]
  };
  return wavelengths[analysisType] || [];
};

const SampleEditForm = ({ sample, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...sample,
    absorbance_values: { ...sample.absorbance_values }
  });
  const wavelengths = getWavelengthsForAnalysis(sample.analysis_type);
  
  const handleAbsorbanceChange = (wavelength, value) => {
    setFormData(prev => ({
      ...prev,
      absorbance_values: {
        ...prev.absorbance_values,
        [wavelength]: value
      }
    }));
  };

  const handleSave = () => {
    // 빈 문자열은 0으로, 유효한 숫자는 그대로 변환
    const processedValues = {};
    Object.entries(formData.absorbance_values).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        processedValues[key] = 0;
      } else {
        const numValue = parseFloat(value);
        processedValues[key] = isNaN(numValue) ? 0 : numValue;
      }
    });

    const processedFormData = {
      ...formData,
      absorbance_values: processedValues
    };
    
    onSave(processedFormData, true);
    onCancel(); // 저장 후 다이얼로그 닫기
  };

  // 흡광도 값 개수에 따른 그리드 클래스 결정
  const getGridCols = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-4";
    // Add more conditions if needed for other counts, or default
    return "grid-cols-3"; // 기본값
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ marginLeft: '520px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.3 
        }}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-6"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 text-center">샘플 수정</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">처리구 이름</Label>
              <Input 
                value={formData.treatment_name || ''} 
                onChange={e => setFormData({...formData, treatment_name: e.target.value})} 
                className="h-12 text-base font-medium rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20" 
                placeholder="예: Control"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">샘플 이름</Label>
              <Input 
                value={formData.sample_name || ''} 
                onChange={e => setFormData({...formData, sample_name: e.target.value})} 
                className="h-12 text-base font-medium rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20" 
                placeholder="예: Rep1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-700">흡광도 값</Label>
            <div className={`grid ${getGridCols(wavelengths.length)} gap-4`}>
              {wavelengths.map(wl => (
                <div key={wl} className="space-y-3">
                  <div className="text-center">
                    <Label className="text-sm font-medium text-gray-700">
                      {wl} nm
                    </Label>
                  </div>
                  <Input 
                    type="number" 
                    inputMode="decimal"
                    step="any"
                    value={formData.absorbance_values[wl] ?? ''} 
                    onChange={e => handleAbsorbanceChange(wl, e.target.value)} 
                    className="h-14 text-center font-mono text-lg rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20" 
                    placeholder="0.000"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="flex-1 h-12 rounded-xl border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
            >
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              저장
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function SampleResults({ samples, selectedIds, onSelectionChange, onEdit, onRemove, onRemoveMultiple, analysisType }) {
  const [editingSample, setEditingSample] = useState(null);

  // 선택된 샘플만 내보내기
  const exportSelectedResults = () => {
    const selectedSamples = samples.filter(sample => selectedIds.has(sample.id));
    if (selectedSamples.length === 0) return;
    
    // Adjust headers and rows based on analysis_type for chlorophyll
    const csvRows = [];
    if (selectedSamples[0]?.analysis_type === "chlorophyll_a_b") {
      csvRows.push(['처리구명', '샘플명', 'Chl a', 'Chl b', 'Carotenoid', '단위'].join(','));
      selectedSamples.forEach(sample => {
        csvRows.push([
          `"${sample.treatment_name}"`,
          `"${sample.sample_name}"`,
          (sample.chl_a || 0).toFixed(4),
          (sample.chl_b || 0).toFixed(4),
          (sample.carotenoid || 0).toFixed(4),
          `"${sample.unit}"`
        ].join(','));
      });
    } else {
      csvRows.push(['처리구명', '샘플명', '분석결과', '단위'].join(','));
      selectedSamples.forEach(sample => {
        csvRows.push([
          `"${sample.treatment_name}"`,
          `"${sample.sample_name}"`,
          sample.result.toFixed(4),
          `"${sample.unit}"`
        ].join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `selected_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 전체 샘플 내보내기
  const exportAllResults = () => {
    if (samples.length === 0) return;
    
    const csvRows = [];
    if (samples[0]?.analysis_type === "chlorophyll_a_b") {
      csvRows.push(['처리구명', '샘플명', 'Chl a', 'Chl b', 'Carotenoid', '단위'].join(','));
      samples.forEach(sample => {
        csvRows.push([
          `"${sample.treatment_name}"`,
          `"${sample.sample_name}"`,
          (sample.chl_a || 0).toFixed(4),
          (sample.chl_b || 0).toFixed(4),
          (sample.carotenoid || 0).toFixed(4),
          `"${sample.unit}"`
        ].join(','));
      });
    } else {
      csvRows.push(['처리구명', '샘플명', '분석결과', '단위'].join(','));
      samples.forEach(sample => {
        csvRows.push([
          `"${sample.treatment_name}"`,
          `"${sample.sample_name}"`,
          sample.result.toFixed(4),
          `"${sample.unit}"`
        ].join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `all_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(new Set(samples.map(s => s.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectOne = (id, checked) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    onSelectionChange(newSet);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size > 0) {
      onRemoveMultiple(Array.from(selectedIds));
    }
  };

  const handleDeleteAll = () => {
    if (samples.length > 0) {
      onRemoveMultiple(samples.map(s => s.id));
    }
  };

  return (
    <>
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 h-full">
        <CardHeader className="pb-3">
            <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="select-all"
                        checked={selectedIds.size === samples.length && samples.length > 0}
                        onCheckedChange={handleSelectAll}
                    />
                    <CardTitle className="text-gray-900 text-base sm:text-lg font-semibold flex items-center space-x-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>등록된 샘플 ({samples.length})</span>
                    </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedIds.size > 0 && (
                        <Button 
                            onClick={handleDeleteSelected}
                            variant="outline" 
                            size="sm"
                            className="h-8 rounded-lg bg-red-50 border-red-200 text-red-600 hover:bg-red-100 font-medium text-xs px-3"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            <span>선택 삭제 ({selectedIds.size})</span>
                        </Button>
                    )}
                    <Button 
                        onClick={handleDeleteAll}
                        variant="outline"
                        size="sm" 
                        className="h-8 rounded-lg bg-red-50 border-red-200 text-red-600 hover:bg-red-100 font-medium text-xs px-3"
                        disabled={samples.length === 0}
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        <span>전체 삭제</span>
                    </Button>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="outline"
                                size="sm" 
                                className="h-8 rounded-lg bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-xs px-3"
                            >
                                <Download className="h-3 w-3 mr-1" />
                                <span>내보내기</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                            <DropdownMenuItem 
                                onClick={exportSelectedResults}
                                disabled={selectedIds.size === 0}
                                className="cursor-pointer"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                선택 내보내기 ({selectedIds.size}개)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={exportAllResults}
                                disabled={samples.length === 0}
                                className="cursor-pointer"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                전체 내보내기 ({samples.length}개)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {samples.map((sample) => (
              <div key={sample.id} className="p-3 rounded-xl bg-white/60 ios-shadow border border-gray-100/50 flex items-center gap-2">
                <Checkbox 
                  checked={selectedIds.has(sample.id)}
                  onCheckedChange={(checked) => handleSelectOne(sample.id, checked)}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0 px-2 py-0">
                      {sample.treatment_name}
                    </Badge>
                    <span className="text-gray-800 font-medium text-sm truncate">{sample.sample_name}</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                    {Object.entries(sample.absorbance_values).map(([wl, val]) => (
                      <div key={wl} className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          <span className="text-gray-500">{wl}:</span>
                          <span className="font-medium text-gray-800 ml-1">{Number(val).toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 px-2">
                  {sample.analysis_type === "chlorophyll_a_b" ? (
                    <div className="flex space-x-3 items-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Chl a</div>
                        <p className="text-gray-900 font-bold text-sm">
                          {Number(sample.chl_a || 0).toFixed(3)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Chl b</div>
                        <p className="text-gray-900 font-bold text-sm">
                          {Number(sample.chl_b || 0).toFixed(3)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Car</div>
                        <p className="text-gray-900 font-bold text-sm">
                          {Number(sample.carotenoid || 0).toFixed(3)}
                        </p>
                      </div>
                      <div className="self-end">
                        <p className="text-gray-500 text-xs pb-0.5">{sample.unit}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-end">
                      <p className="text-gray-900 font-bold text-sm">
                        {Number(sample.result).toFixed(3)}
                      </p>
                      <p className={`text-gray-500 text-xs ${!sample.unit || sample.unit.startsWith('%') ? 'ml-0.5' : 'ml-1'}`}>{sample.unit}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button 
                    onClick={() => setEditingSample(sample)} 
                    variant="ghost" 
                    size="icon" 
                    className="w-7 h-7 p-0 rounded-full text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    onClick={() => onRemove(sample.id)} 
                    variant="ghost" 
                    size="icon" 
                    className="w-7 h-7 p-0 rounded-full text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {samples.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                등록된 샘플이 없습니다
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {editingSample && (
          <SampleEditForm 
            sample={editingSample} 
            onSave={onEdit} 
            onCancel={() => setEditingSample(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
