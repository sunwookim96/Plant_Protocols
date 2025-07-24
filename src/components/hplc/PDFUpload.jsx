import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle, Loader, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExtractDataFromUploadedFile, UploadFile } from "@/api/integrations";

export default function PDFUpload({ onFilesUploaded, rtStandards, onResultsGenerated, analysisType, calculationParams, uploadedFiles = [] }) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // 지수 표기법 숫자 파싱 함수
  const parseScientificNumber = (value) => {
    if (value === null || value === undefined) return 0;
    
    let strValue = String(value).trim();
    
    // 공백이 포함된 지수 표기법 정규화 (예: "2.95e -2" → "2.95e-2")
    strValue = strValue.replace(/e\s*[-−+]?\s*(\d+)/gi, (match, digits) => {
      const sign = match.includes('-') || match.includes('−') ? '-' : '+';
      return `e${sign}${digits}`;
    });
    
    // E도 e로 통일
    strValue = strValue.replace(/E/g, 'e');
    
    // 마이너스 기호 통일 (−를 -로)
    strValue = strValue.replace(/−/g, '-');
    
    // 지수 표기법 숫자 정규식으로 추출
    const numRegex = /-?\d+\.?\d*(?:e[-+]?\d+)?/i;
    const match = strValue.match(numRegex);
    
    if (match) {
      const parsed = parseFloat(match[0]);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // 일반 숫자로 파싱 시도
    const parsed = parseFloat(strValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseFileName = (fileName) => {
    const nameWithoutExt = fileName.replace(/\.pdf$/i, '');
    const parts = nameWithoutExt.split('_');
    return {
      factor: parts[0] || nameWithoutExt,
      treatment: parts[1] || 'N/A', 
      replicate: parts[2] || '1'
    };
  };

  const matchRTWithStandards = (sampleRTs, standards) => {
    let matchedData = [];
    
    Object.entries(standards).forEach(([compound, standardRT]) => {
      const integerRange = Math.floor(standardRT);
      const rangeStart = integerRange;
      const rangeEnd = integerRange + 1;
      
      const candidates = sampleRTs.filter(rt => rt.rt >= rangeStart && rt.rt < rangeEnd);
      
      if (candidates.length > 0) {
        const closestMatch = candidates.reduce((prev, curr) => 
          Math.abs(curr.rt - standardRT) < Math.abs(prev.rt - standardRT) ? curr : prev
        );
        
        matchedData.push({
          compound,
          standardRT,
          matchedRT: closestMatch.rt,
          area: closestMatch.area,
        });
      } else {
        matchedData.push({
          compound,
          standardRT,
          matchedRT: null,
          area: null,
        });
      }
    });
    
    return matchedData;
  };

  const handleRemoveFile = (indexToRemove) => {
    // 기존 업로드된 파일 목록에서 해당 인덱스 파일 제거
    const updatedFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    
    // 남은 파일들로부터 결과 재생성
    let allResults = [];
    updatedFiles.forEach(fileInfo => {
      if (fileInfo.processedResults) {
        allResults.push(...fileInfo.processedResults);
      }
    });
    
    // 상태 업데이트: 결과와 파일 목록 모두 업데이트
    onResultsGenerated(allResults);
    
    // 파일 목록을 직접 업데이트하도록 부모에게 전달
    // 이때 processedResults는 유지해야 하므로 제거하지 않음
    onFilesUploaded(updatedFiles, true); // 두 번째 인수로 덮어쓰기 모드 표시
  };

  const processAllFiles = async (newFiles) => {
    if (Object.keys(rtStandards).length === 0) {
      setUploadResult({ success: false, message: "RT 기준을 먼저 입력하고 적용해주세요." });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      let allResults = [];
      let newProcessedFiles = [];

      // 기존 파일들의 결과를 먼저 추가
      uploadedFiles.forEach(existingFile => {
        if (existingFile.processedResults) {
          allResults.push(...existingFile.processedResults);
        }
      });

      // 새 파일들 처리
      for (const { file, name } of newFiles) {
        if (!name.toLowerCase().endsWith('.pdf')) continue;
        
        const uploadResponse = await UploadFile({ file });
        const fileUrl = uploadResponse.file_url;
        
        const extractResponse = await ExtractDataFromUploadedFile({
          file_url: fileUrl,
          json_schema: {
            type: "object",
            properties: {
              peaks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    "Ret. Time": { type: "number" },
                    "Area": { type: "number" },
                    "retention_time": { type: "number" },
                    "area": { type: "number" },
                    "rt": { type: "number" },
                    "peak_area": { type: "number" },
                  },
                },
              },
            },
          },
        });

        if (extractResponse.status === "success" && extractResponse.output?.peaks) {
          const fileInfo = parseFileName(name);
          
          // 지수 표기법을 포함한 숫자 파싱 개선
          const normalizedPeaks = extractResponse.output.peaks.map(peak => ({
            rt: parseScientificNumber(peak['Ret. Time'] || peak.retention_time || peak.rt || 0),
            area: parseScientificNumber(peak['Area'] || peak.area || peak.peak_area || 0)
          })).filter(peak => peak.rt > 0 && peak.area > 0);
          
          const matchResults = matchRTWithStandards(normalizedPeaks, rtStandards);
          
          const fileResults = matchResults.map(result => ({
            sampleName: name,
            ...fileInfo,
            ...result
          }));

          allResults.push(...fileResults);

          // 파일 정보에 처리 결과 저장
          newProcessedFiles.push({ 
            name, 
            originalFile: file, 
            ...fileInfo, 
            peaks: normalizedPeaks.length,
            processedResults: fileResults
          });
        }
      }
      
      onResultsGenerated(allResults);
      onFilesUploaded(newProcessedFiles, false); // 두 번째 인수로 추가 모드 표시

      if (newFiles.length > 0) {
        setUploadResult({ success: true, message: `${newFiles.length}개 파일이 성공적으로 처리되었습니다.` });
      }

    } catch (error) {
      setUploadResult({ success: false, message: "파일 처리 중 오류 발생: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    const filesToProcess = files.map(f => ({ file: f, name: f.name }));
    await processAllFiles(filesToProcess);
    
    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload({ target: { files } });
  };

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-gray-900 text-lg font-semibold flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>PDF 파일 업로드</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 ${isDragOver ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 bg-gray-50/50'}`}
          onDragOver={(e) => {e.preventDefault(); setIsDragOver(true);}}
          onDragLeave={(e) => {e.preventDefault(); setIsDragOver(false);}}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            {uploading ? <Loader className="h-6 w-6 text-blue-600 animate-spin" /> : <FileText className="h-6 w-6 text-blue-600" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF 업로드</h3>
          
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading || Object.keys(rtStandards).length === 0} className="ios-button bg-blue-600 hover:bg-blue-700 h-10 px-6 text-sm rounded-xl">
            {uploading ? "업로드 중..." : "파일 선택"}
          </Button>
          
          <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={handleFileUpload} className="hidden" />

          {Object.keys(rtStandards).length === 0 && <p className="text-amber-600 text-xs mt-2">⚠️ RT 기준을 먼저 입력해주세요.</p>}
           <p className="text-xs text-gray-500 mt-2">파일명 형식: Factor_Treatment_Replicate.pdf</p>
        </div>

        {uploadResult && (
          <Alert className={`mt-3 ${uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center space-x-2">
              {uploadResult.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription className={`text-xs ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>{uploadResult.message}</AlertDescription>
            </div>
          </Alert>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-gray-900 text-sm font-semibold mb-2">업로드된 파일 ({uploadedFiles.length}개)</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-white/60 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-2 min-w-0">
                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-xs truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-gray-600">{file.factor} • {file.treatment} • Rep{file.replicate}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleRemoveFile(index)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}