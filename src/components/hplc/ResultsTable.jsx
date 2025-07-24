import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Database } from "lucide-react";

export default function ResultsTable({ results, analysisType }) {
  const handleExport = () => {
    if (results.length === 0) return;

    const unit = analysisType === 'phenol' ? 'mg/g' : 'µmol/g dry wt.';
    const headers = ['Sample Name', 'Factor', 'Treatment', 'Replicate', 'Compound', 'Standard_RT', 'Matched_RT', 'Area', unit];
    const csvRows = [headers.join(',')];
    
    results.forEach(result => {
      csvRows.push([
        `"${result.sampleName}"`,
        `"${result.factor}"`,
        `"${result.treatment}"`,
        `"${result.replicate}"`,
        `"${result.compound}"`,
        result.standardRT?.toFixed(2) || '',
        result.matchedRT?.toFixed(2) || '',
        result.area || '',
        result.concentration ? result.concentration.toFixed(6) : ''
      ].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `hplc_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) {
    return null;
  }

  const unit = analysisType === 'phenol' ? 'mg/g' : 'µmol/g dry wt.';

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>분석 결과 ({results.length})</span>
          </CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>CSV 내보내기</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-sm">
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Sample</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Factor</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Treatment</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Rep</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Compound</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Std RT</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Match RT</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Area</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">{unit}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-2 px-2 text-gray-900 font-medium truncate" title={result.sampleName}>{result.sampleName}</td>
                  <td className="py-2 px-2 text-gray-700">{result.factor}</td>
                  <td className="py-2 px-2 text-gray-700">{result.treatment}</td>
                  <td className="py-2 px-2 text-gray-700">{result.replicate}</td>
                  <td className="py-2 px-2 text-gray-700">{result.compound}</td>
                  <td className="py-2 px-2 text-gray-700 font-mono text-right">{result.standardRT ? result.standardRT.toFixed(2) : '-'}</td>
                  <td className="py-2 px-2 text-gray-700 font-mono text-right">{result.matchedRT ? result.matchedRT.toFixed(2) : '-'}</td>
                  <td className="py-2 px-2 text-gray-700 font-mono text-right">{result.area !== null ? Number(result.area).toPrecision(6) : '-'}</td>
                  <td className="py-2 px-2 text-gray-700 font-mono text-right">{result.concentration !== null && !isNaN(result.concentration) ? Number(result.concentration).toFixed(4) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}