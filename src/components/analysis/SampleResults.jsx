import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Edit, Trash2, X, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const getWavelengthsForAnalysis = (analysisType) => {
  const wavelengths = {
    chlorophyll_a_b: ["665.2", "652.4"],
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
  const [formData, setFormData] = useState(sample);
  const wavelengths = getWavelengthsForAnalysis(sample.analysis_type);
  
  const handleAbsorbanceChange = (wavelength, value) => {
    setFormData(prev => ({
      ...prev,
      absorbance_values: {
        ...prev.absorbance_values,
        [wavelength]: value === '' ? '' : parseFloat(value) || 0
      }
    }));
  };

  return (
    <DialogContent className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 p-8 max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-gray-900 text-2xl font-semibold">샘플 수정</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>처리구 이름</Label>
            <Input value={formData.treatment_name} onChange={e => setFormData({...formData, treatment_name: e.target.value})} className="ios-input border-0" />
          </div>
          <div className="space-y-2">
            <Label>샘플 이름</Label>
            <Input value={formData.sample_name} onChange={e => setFormData({...formData, sample_name: e.target.value})} className="ios-input border-0" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>흡광도 값</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wavelengths.map(wl => (
              <div key={wl}>
                <Label className="text-sm">{wl} nm</Label>
                <Input 
                  type="text" 
                  value={formData.absorbance_values[wl] || ''} 
                  onChange={e => handleAbsorbanceChange(wl, e.target.value)} 
                  className="ios-input border-0" 
                  placeholder="0.000"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onCancel} variant="ghost" className="rounded-xl">취소</Button>
        <Button onClick={() => onSave(formData, true)} className="ios-button rounded-xl">저장</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function SampleResults({ samples, selectedIds, onSelectionChange, onEdit, onRemove, onRemoveMultiple }) {
  const [editingSample, setEditingSample] = useState(null);

  const exportResults = () => {
    if (samples.length === 0) return;
    const headers = ['처리구명', '샘플명', '분석결과', '단위', '등록일'];
    const csvRows = [
      headers.join(','),
      ...samples.map(sample => [
        `"${sample.treatment_name}"`,
        `"${sample.sample_name}"`,
        sample.result.toFixed(4),
        `"${sample.unit}"`,
        `"${new Date(sample.created_date).toLocaleDateString()}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analysis_results_${Date.now()}.csv`);
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
    <Dialog onOpenChange={(isOpen) => !isOpen && setEditingSample(null)}>
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-4">
                <Checkbox
                    id="select-all"
                    checked={selectedIds.size === samples.length && samples.length > 0}
                    onCheckedChange={handleSelectAll}
                />
                <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>등록된 샘플 ({samples.length})</span>
                </CardTitle>
            </div>
            <div className="flex space-x-2">
                {selectedIds.size > 0 && (
                    <Button 
                        onClick={handleDeleteSelected}
                        variant="outline" 
                        className="h-10 rounded-xl bg-red-50 border-red-200 text-red-600 hover:bg-red-100 font-semibold"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        선택 삭제 ({selectedIds.size})
                    </Button>
                )}
                <Button 
                    onClick={handleDeleteAll}
                    variant="outline" 
                    className="h-10 rounded-xl bg-red-50 border-red-200 text-red-600 hover:bg-red-100 font-semibold"
                    disabled={samples.length === 0}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    전체 삭제
                </Button>
                <Button 
                    onClick={exportResults} 
                    variant="outline" 
                    className="h-10 rounded-xl bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                    <Download className="h-4 w-4 mr-2" />
                    결과 내보내기
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[28rem] overflow-y-auto">
            {samples.map((sample) => (
              <div key={sample.id} className="p-3 rounded-2xl bg-white/60 ios-shadow border border-gray-100/50 flex items-center gap-3">
                <Checkbox 
                  checked={selectedIds.has(sample.id)}
                  onCheckedChange={(checked) => handleSelectOne(sample.id, checked)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {sample.treatment_name}
                    </Badge>
                    <span className="text-gray-800 font-medium text-sm truncate">{sample.sample_name}</span>
                  </div>
                   <div className="text-xs text-gray-400">
                    흡광도: {Object.entries(sample.absorbance_values).map(([wl, val]) => 
                      `${wl}=${Number(val).toFixed(3)}`
                    ).join(", ")}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-gray-900 font-bold text-base">
                        {Number(sample.result).toFixed(4)}
                    </p>
                    <p className="text-gray-500 text-xs">{sample.unit}</p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingSample(sample)} variant="ghost" className="w-8 h-8 p-0 rounded-full text-blue-600 hover:bg-blue-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <Button onClick={() => onRemove(sample.id)} variant="ghost" className="w-8 h-8 p-0 rounded-full text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {samples.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                등록된 샘플이 없습니다
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {editingSample && <SampleEditForm sample={editingSample} onSave={onEdit} onCancel={() => setEditingSample(null)} />}
    </Dialog>
  );
}