import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// CSV 파싱 함수
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
};

export default function ExcelUpload({ analysisType, onSamplesUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload({ target: { files } });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let json = [];
        
        if (file.name.endsWith('.csv')) {
          // CSV 파일 처리
          const text = e.target.result;
          json = parseCSV(text);
        } else {
          // Excel 파일 처리 (현재는 CSV만 지원)
          throw new Error("현재는 CSV 파일만 지원됩니다. Excel 파일을 CSV로 변환해주세요.");
        }

        const wavelengths = getWavelengthsForAnalysis(analysisType);
        
        const processedSamples = json.map(row => {
          const absorbance_values = {};
          wavelengths.forEach(wl => {
            const value = parseFloat(row[wl]) || 0;
            absorbance_values[wl] = value;
          });
          return {
            treatment_name: row["treatment_name"] || row["처리구명"] || "N/A",
            sample_name: row["sample_name"] || row["샘플명"] || "N/A",
            absorbance_values,
          };
        });

        onSamplesUploaded(processedSamples);
        setUploadResult({
          success: true,
          message: `${processedSamples.length}개 샘플이 성공적으로 업로드되었습니다.`
        });
      } catch (error) {
        setUploadResult({
          success: false,
          message: "파일 처리 중 오류가 발생했습니다: " + error.message
        });
      } finally {
        setUploading(false);
      }
    };
    
    reader.onerror = (error) => {
      setUploadResult({ success: false, message: "파일 읽기 오류: " + error.toString() });
      setUploading(false);
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };
  
  if (!analysisType) {
    return (
      <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 font-medium">분석 항목을 먼저 선택해주세요</p>
        </CardContent>
      </Card>
    );
  }

  const wavelengths = getWavelengthsForAnalysis(analysisType);

  return (
    <div 
        className={`ios-card ios-blur rounded-3xl ios-shadow-lg border-0 p-8 transition-all duration-300 ${
          isDragOver ? 'border-2 border-dashed border-blue-400 bg-blue-50/50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">파일 업로드</h3>
          <p className="text-gray-500 mb-6">CSV 파일을 드래그하거나 버튼을 클릭하여 업로드하세요</p>
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading} 
            className="ios-button bg-green-600 hover:bg-green-700 h-14 w-full text-base rounded-2xl mb-6"
          >
            <Upload className="h-5 w-5 mr-2" />
            {uploading ? "업로드 중..." : "파일 선택"}
          </Button>
          
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileUpload} 
            className="hidden" 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="text-left space-y-3 p-4 bg-gray-50/80 rounded-xl">
              <h4 className="text-gray-800 font-semibold">파일 형식 안내</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>• A1:</strong> 처리구명 (treatment_name)</p>
                <p><strong>• B1:</strong> 샘플명 (sample_name)</p>
                <p><strong>• C1 이후:</strong> 파장값 (예: 665.2, 652.4)</p>
                <p className="text-xs text-gray-500 mt-2">※ 1행부터 데이터가 시작됩니다</p>
              </div>
            </div>
            
            <div className="text-left space-y-3 p-4 bg-blue-50/80 rounded-xl">
              <h4 className="text-blue-800 font-semibold">필요한 파장</h4>
              <div className="flex flex-wrap gap-1">
                {wavelengths.map(wl => (
                  <span key={wl} className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {wl} nm
                  </span>
                ))}
              </div>
            </div>
          </div>

          {uploadResult && (
            <Alert className={`mt-4 w-full ${uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={uploadResult.success ? 'text-green-800' : 'text-red-800'}>
                  {uploadResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </div>
  );
}