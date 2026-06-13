'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { parseCSV, rowsToObjects, BULK_IMPORT_TEMPLATE } from '@/lib/csv';

interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
  total: number;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview([]);
    setLoading(false);
    setResult(null);
    setParseError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseFile = (selectedFile: File) => {
    setParseError('');
    setPreview([]);
    setResult(null);

    if (!selectedFile.name.endsWith('.csv')) {
      setParseError('Please upload a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setParseError('CSV must have a header row and at least one data row');
          return;
        }

        const objects = rowsToObjects(rows);
        if (objects.length === 0) {
          setParseError('No valid data rows found');
          return;
        }

        // Validate headers
        const firstRow = objects[0];
        const hasName = 'name' in firstRow;
        const hasCategory = 'category' in firstRow;
        if (!hasName || !hasCategory) {
          setParseError('CSV must have "name" and "category" columns. Found: ' + Object.keys(firstRow).join(', '));
          return;
        }

        setPreview(objects.slice(0, 5));
        setFile(selectedFile);
      } catch (err) {
        setParseError('Failed to parse CSV: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) parseFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) parseFile(droppedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      const text = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });

      const rows = parseCSV(text);
      const objects = rowsToObjects(rows);

      // Map to API format
      const products = objects.map((obj) => {
        const imageUrls = [
          obj.image_url,
          obj.image_url_2,
          obj.image_url_3,
          obj.image_url_4,
        ].filter((url) => url && url.trim().length > 0);

        return {
          name: obj.name,
          brand: obj.brand || undefined,
          category: obj.category,
          description: obj.description || undefined,
          price: obj.price ? parseFloat(obj.price) : undefined,
          sku: obj.sku || undefined,
          stockStatus: obj.stock_status || 'instock',
          stockQuantity: obj.stock_quantity ? parseInt(obj.stock_quantity, 10) : 0,
          featured: obj.featured?.toLowerCase() === 'true',
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        };
      });

      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (data.errors.length === 0) {
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 1500);
        }
      } else {
        setParseError(data.error || 'Import failed');
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([BULK_IMPORT_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'babyhaus-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e8e4df] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-[#2d2d2d]">Bulk Import Products</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-[#f5f1ec] transition-colors text-[#7a7a7a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Template download */}
          <div className="flex items-center gap-3 p-4 bg-[#faf8f5] rounded-xl border border-[#e8e4df]">
            <FileSpreadsheet className="w-8 h-8 text-[#d4a574]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#2d2d2d]">Download template</p>
              <p className="text-xs text-[#7a7a7a]">CSV with name, category, price, SKU, images, etc.</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#e8e4df] text-sm font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
          </div>

          {/* Drop zone */}
          {!result && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-[#d4a574] bg-[#f5ebe0]'
                    : file
                    ? 'border-green-300 bg-green-50'
                    : 'border-[#e8e4df] bg-[#faf8f5] hover:border-[#d4a574] hover:bg-[#f5ebe0]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-green-500' : 'text-[#b0b0b0]'}`} />
                <p className="text-sm font-semibold text-[#2d2d2d]">
                  {file ? file.name : 'Drop CSV file here or click to browse'}
                </p>
                <p className="text-xs text-[#7a7a7a] mt-1">Maximum 200 products per import</p>
              </div>

              {parseError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {parseError}
                </div>
              )}

              {/* Preview */}
              {preview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#7a7a7a]">
                    Preview ({preview.length} of {preview.length}+ rows)
                  </p>
                  <div className="overflow-x-auto border border-[#e8e4df] rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#faf8f5] border-b border-[#e8e4df]">
                          <th className="px-3 py-2 font-semibold text-[#7a7a7a]">Name</th>
                          <th className="px-3 py-2 font-semibold text-[#7a7a7a]">Category</th>
                          <th className="px-3 py-2 font-semibold text-[#7a7a7a]">Price</th>
                          <th className="px-3 py-2 font-semibold text-[#7a7a7a]">SKU</th>
                          <th className="px-3 py-2 font-semibold text-[#7a7a7a]">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-b border-[#e8e4df]/60">
                            <td className="px-3 py-2 font-medium text-[#2d2d2d] truncate max-w-[150px]">{row.name}</td>
                            <td className="px-3 py-2 text-[#7a7a7a]">{row.category}</td>
                            <td className="px-3 py-2 text-[#d4a574] font-semibold">{row.price ? `$${row.price}` : '-'}</td>
                            <td className="px-3 py-2 text-[#7a7a7a]">{row.sku || '-'}</td>
                            <td className="px-3 py-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                row.stock_status === 'instock' ? 'bg-green-50 text-green-600' :
                                row.stock_status === 'preorder' ? 'bg-amber-50 text-amber-600' :
                                'bg-red-50 text-red-600'
                              }`}>
                                {row.stock_status || 'instock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="w-full px-6 py-3 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {preview.length > 0 ? `${preview.length}+ products` : 'Products'}
                  </>
                )}
              </button>
            </>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {result.errors.length === 0 ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-bold text-[#2d2d2d]">
                    {result.created} of {result.total} products imported
                  </p>
                  <p className="text-xs text-[#7a7a7a]">
                    {result.errors.length === 0
                      ? 'All products imported successfully!'
                      : `${result.errors.length} row${result.errors.length > 1 ? 's' : ''} had errors`}
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 text-xs font-bold text-red-600 border-b border-red-200">
                    Errors ({result.errors.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <div key={i} className="px-4 py-2 text-xs border-b border-[#e8e4df]/60 last:border-0">
                        <span className="font-semibold text-[#2d2d2d]">Row {err.row}:</span>{' '}
                        <span className="text-red-500">{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {result.errors.length > 0 && (
                  <button
                    onClick={reset}
                    className="flex-1 px-6 py-3 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
