import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export default function ViewingHistoryUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/viewing-history/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (result: UploadResult) => {
      setUploadResult(result);
      toast({
        title: "Upload Complete",
        description: `Imported ${result.imported} items, skipped ${result.skipped}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/viewing-history"] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['text/csv', 'application/json', '.csv', '.json'];
    const fileExtension = file.name.toLowerCase();
    
    if (!validTypes.some(type => fileExtension.includes(type.replace('.', '')))) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or JSON file",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Viewing History
          </CardTitle>
          <CardDescription>
            Import your watching data from streaming platforms using CSV or JSON files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {dragActive ? "Drop your file here" : "Upload viewing history"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your CSV or JSON file, or click to select
            </p>
            <div className="space-y-2">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.json"
                onChange={handleFileChange}
                disabled={uploadMutation.isPending}
              />
              <Button 
                asChild 
                disabled={uploadMutation.isPending}
                className="cursor-pointer"
              >
                <label htmlFor="file-upload">
                  {uploadMutation.isPending ? "Uploading..." : "Select File"}
                </label>
              </Button>
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <Alert className={uploadResult.success ? "border-green-500" : "border-red-500"}>
              {uploadResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>Import Results:</strong> {uploadResult.imported} items imported, 
                    {uploadResult.skipped} skipped
                  </p>
                  {uploadResult.errors.length > 0 && (
                    <div>
                      <p className="text-red-600 font-medium">Errors:</p>
                      <ul className="list-disc list-inside text-sm">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Format Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Supported File Formats:</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h5 className="font-medium mb-2">CSV Format</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Required columns: title, date_watched
                </p>
                <div className="bg-muted p-2 rounded text-xs font-mono">
                  title,date_watched,rating,platform<br/>
                  "Breaking Bad",2024-01-15,5,Netflix<br/>
                  "The Office",2024-01-16,4,Hulu
                </div>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-2">JSON Format</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Array of viewing records
                </p>
                <div className="bg-muted p-2 rounded text-xs font-mono">
                  [{`{`}<br/>
                  &nbsp;&nbsp;"title": "Breaking Bad",<br/>
                  &nbsp;&nbsp;"date_watched": "2024-01-15",<br/>
                  &nbsp;&nbsp;"rating": 5,<br/>
                  &nbsp;&nbsp;"platform": "Netflix"<br/>
                  {`}`}]
                </div>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How to get your data:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>Netflix:</strong> Go to Account Settings → Download your information → Viewing Activity</li>
                  <li><strong>Hulu:</strong> Contact customer support to request viewing history export</li>
                  <li><strong>Amazon Prime:</strong> Go to Manage Your Content and Devices → Privacy Settings</li>
                  <li><strong>Manual tracking:</strong> Create your own CSV with shows you've watched</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}