
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// 더 똑똑하게 CSV를 파싱하는 함수
const parseCSV = (text) => {
  // 1. 줄바꿈 처리 (Windows, Mac, Linux 호환)
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return []; // 헤더와 데이터가 최소 1줄씩은 있어야 함

  // 2. 구분자 자동 감지 (쉼표, 세미콜론, 탭)
  const headerLine = lines[0];
  const delimiters = [',', ';', '\t'];
  let bestDelimiter = ',';
  let maxCount = 0;

  delimiters.forEach(d => {
    const count = headerLine.split(d).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = d;
    }
  });

  // 3. 헤더 정리 (따옴표 및 공백 제거)
  const headers = lines[0].split(bestDelimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  
  // 4. 데이터 파싱
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(bestDelimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) { // 열 개수가 헤더와 같은 줄만 처리
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
    }
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

  // 샘플 템플릿 다운로드
  const downloadSampleTemplate = () => {
    if (!analysisType) return;
    
    const wavelengths = getWavelengthsForAnalysis(analysisType);
    const headers = ['treatment_name', 'sample_name', ...wavelengths];
    
    // 샘플 데이터 3개 행 추가
    const sampleRows = [
      ['Control', 'Rep1', ...wavelengths.map(() => '0.123')],
      ['Control', 'Rep2', ...wavelengths.map(() => '0.145')],
      ['Treatment', 'Rep1', ...wavelengths.map(() => '0.098')]
    ];
    
    const csvRows = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sample_template_${analysisType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          const text = e.target.result;
          json = parseCSV(text); // 개선된 파싱 함수 사용
        } else {
          throw new Error("현재는 CSV 파일만 지원됩니다. Excel 파일을 CSV로 변환해주세요.");
        }

        if (json.length === 0) {
          throw new Error("파일에서 유효한 데이터를 읽지 못했습니다. 파일 형식(헤더, 구분자)을 확인해주세요.");
        }
        
        const wavelengths = getWavelengthsForAnalysis(analysisType);
        
        const processedSamples = json.map(row => {
          const absorbance_values = {};
          wavelengths.forEach(wl => {
            // 숫자 변환 시 쉼표(,)를 점(.)으로 바꿔서 소수점 인식률 높임
            const valueStr = String(row[wl] || '0').replace(',', '.');
            const value = parseFloat(valueStr) || 0;
            absorbance_values[wl] = value;
          });
          return {
            treatment_name: row["treatment_name"] || row["처리구명"] || "N/A",
            sample_name: row["sample_name"] || row["샘플명"] || "N/A",
            absorbance_values,
          };
        });

        if (processedSamples.length > 0) {
            onSamplesUploaded(processedSamples);
            setUploadResult({
                success: true,
                message: `${processedSamples.length}개 샘플이 성공적으로 업로드되었습니다.`
            });
        } else {
            throw new Error("샘플 데이터를 처리하지 못했습니다. 열 이름(헤더)이 올바른지 확인해주세요.");
        }
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
    
    // 한글 깨짐 방지를 위해 UTF-8 인코딩 명시
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      setUploadResult({ success: false, message: "CSV 파일만 지원됩니다." });
      setUploading(false);
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

  return (
    <div 
        className={`ios-card ios-blur rounded-3xl ios-shadow-lg border-0 p-8 transition-all duration-300 ${
          isDragOver ? 'border-2 border-dashed border-blue-400 bg-blue-50/50' : 'border-2 border-dashed border-gray-200'
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
          <p className="text-gray-500 mb-2 whitespace-nowrap">템플릿을 다운로드하여 데이터를 입력한 후, 파일을 업로드해주세요.</p>
          <p className="text-gray-400 text-sm mb-6">파일을 여기로 드래그하거나 버튼을 클릭하여 업로드하세요.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
            <Button 
              onClick={downloadSampleTemplate}
              variant="outline"
              className="h-14 flex-1 text-base rounded-2xl border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Download className="h-5 w-5 mr-2" />
              템플릿 다운로드
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading} 
              className="ios-button bg-green-600 hover:bg-green-700 h-14 flex-1 text-base rounded-2xl"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? "업로드 중..." : "파일 선택"}
            </Button>
          </div>
          
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="hidden" 
          />

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
