import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  total: number;
  progressPercent: number;
  details: {
    importedShows: Array<{ title: string; platform: string }>;
    skippedEntries: Array<{ entry: any; reason: string }>;
  };
}

export default function ViewingHistoryImport() {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async ({ data, platform, dataType }: { data: any[], platform: string, dataType: string }) => {
      setProcessingStage("Starting import...");
      setUploadProgress(0);
      
      // Create a progress interval that goes to 85% then waits for completion
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 85) {
            const increment = Math.random() * 4 + 2; // Faster increment between 2-6%
            return Math.min(prev + increment, 85);
          }
          return prev;
        });
      }, 150); // Updates every 150ms
      
      try {
        setProcessingStage(`Processing ${data.length} viewing history entries...`);
        
        const response = await apiRequest("POST", "/api/viewing-history/import", { data, platform, dataType });
        const result = await response.json() as ImportResult;
        
        // Clear the interval and immediately set to 100%
        clearInterval(progressInterval);
        setUploadProgress(100);
        setProcessingStage("✅ Import completed!");
        
        console.log('API Response:', result);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setProcessingStage("❌ Import failed");
        setUploadProgress(0);
        console.error('API Error:', error);
        throw error;
      } finally {
        // Ensure interval is always cleaned up
        clearInterval(progressInterval);
      }
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      setIsProcessing(false);
      setUploadProgress(100);
      setProcessingStage("✅ Import completed successfully!");
      
      queryClient.invalidateQueries({ queryKey: ["/api/viewing-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      
      toast({
        title: "Import Complete!",
        description: `Successfully imported ${result.imported} shows${result.skipped > 0 ? `, skipped ${result.skipped} entries` : ''}.`,
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingStage("");
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import viewing history. Please check your file format and try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const processFile = async () => {
    if (!file || !dataType) return;

    setIsProcessing(true);
    
    try {
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Improved CSV parser that handles quoted fields with commas
        const lines = text.split('\n');
        
        // Parse CSV line with proper quote handling
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                // Handle escaped quotes
                current += '"';
                i++; // Skip next quote
              } else {
                // Toggle quote state
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              // Field separator outside quotes
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          // Add the last field
          result.push(current.trim());
          return result;
        };
        
        const headers = parseCSVLine(lines[0]);
        
        data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = parseCSVLine(line);
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
      }
      
      if (data.length === 0) {
        throw new Error("No data found in file");
      }
      
      console.log(`Processing ${data.length} entries from ${file.name}`);
      console.log('Sample data structure:', data.slice(0, 3));
      console.log('Headers found:', Object.keys(data[0] || {}));
      
      await importMutation.mutateAsync({
        data,
        platform: dataType,
        dataType
      });
      
    } catch (error: any) {
      setIsProcessing(false);
      console.error('File processing error:', error);
      
      // Show specific error message if available
      const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
      
      toast({
        title: "File Processing Error",
        description: `Failed to process file: ${errorMessage}. Please check the format and try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-teal-500" />
            Import Viewing History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Streaming Platform</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger>
                <SelectValue placeholder="Select streaming platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="netflix">Netflix</SelectItem>
                <SelectItem value="disney_plus">Disney+</SelectItem>
                <SelectItem value="hulu">Hulu</SelectItem>
                <SelectItem value="prime_video">Prime Video</SelectItem>
                <SelectItem value="hbo_max">HBO Max</SelectItem>
                <SelectItem value="paramount_plus">Paramount+</SelectItem>
                <SelectItem value="apple_tv">Apple TV+</SelectItem>
                <SelectItem value="generic">Other/Generic Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File (CSV or JSON)</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {file.name} ({Math.round(file.size / 1024)}KB)
              </p>
            )}
          </div>

          <Button 
            onClick={processFile}
            disabled={!file || !dataType || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Import Viewing History"}
          </Button>
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500 animate-spin" />
              Import in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{processingStage}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your viewing history...
            </p>
          </CardContent>
        </Card>
      )}

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-muted-foreground">Shows Imported</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                <div className="text-sm text-muted-foreground">Entries Skipped</div>
              </div>
            </div>

            {importResult.details.importedShows.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Sample Imported Shows:</h4>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {importResult.details.importedShows.map((show, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-medium">{show.title}</span>
                      <span className="text-muted-foreground ml-2">({show.platform})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.details.skippedEntries.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Skipped Entries:
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {importResult.details.skippedEntries.map((entry, index) => (
                    <div key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <span className="text-muted-foreground">Reason: {entry.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Export Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold">Netflix:</h4>
              <p className="text-muted-foreground">Go to Account → Privacy → Download your information → Select "Viewing activity" → Download CSV</p>
            </div>
            <div>
              <h4 className="font-semibold">Disney+:</h4>
              <p className="text-muted-foreground">Account → Privacy Settings → Request Data → Download viewing history</p>
            </div>
            <div>
              <h4 className="font-semibold">Hulu:</h4>
              <p className="text-muted-foreground">Account → Privacy and Settings → Download Your Information → Viewing History</p>
            </div>
            <div>
              <h4 className="font-semibold">Prime Video:</h4>
              <p className="text-muted-foreground">Account & Settings → Data Export → Request viewing history data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}