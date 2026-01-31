import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Loader2,
  Stethoscope,
  Pill,
  Syringe,
  AlertTriangle,
  ClipboardList,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface MedicalRecord {
  id: string;
  record_type: string;
  title: string;
  description: string | null;
  date_occurred: string | null;
  created_at: string;
}

interface PatientRecordsProps {
  patientId: string | null;
  userRole: "admin" | "practitioner" | "client";
  userId: string;
}

const RECORD_TYPES = [
  { value: "diagnosis", label: "Diagnosis", icon: Stethoscope },
  { value: "procedure", label: "Procedure", icon: ClipboardList },
  { value: "medication", label: "Medication", icon: Pill },
  { value: "allergy", label: "Allergy", icon: AlertTriangle },
  { value: "immunization", label: "Immunization", icon: Syringe },
  { value: "lab_result", label: "Lab Result", icon: FileText },
  { value: "note", label: "Clinical Note", icon: FileText },
];

export const PatientRecords = ({ patientId, userRole, userId }: PatientRecordsProps) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Form state
  const [recordType, setRecordType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateOccurred, setDateOccurred] = useState("");

  const canAddRecords = userRole === "practitioner" || userRole === "admin";

  useEffect(() => {
    if (patientId) {
      fetchRecords();
    }
  }, [patientId]);

  const fetchRecords = async () => {
    if (!patientId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("medical_history")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast({
        title: "Error",
        description: "Failed to load medical records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!patientId || !recordType || !title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("medical_history").insert({
        patient_id: patientId,
        recorded_by: userId,
        record_type: recordType,
        title,
        description: description || null,
        date_occurred: dateOccurred || null,
      });

      if (error) throw error;

      toast({
        title: "Record Added",
        description: "Medical record has been added successfully",
      });
      
      setDialogOpen(false);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error("Error adding record:", error);
      toast({
        title: "Error",
        description: "Failed to add medical record",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setRecordType("");
    setTitle("");
    setDescription("");
    setDateOccurred("");
  };

  const getRecordIcon = (type: string) => {
    const recordType = RECORD_TYPES.find(r => r.value === type);
    const IconComponent = recordType?.icon || FileText;
    return <IconComponent className="w-5 h-5" />;
  };

  const getRecordBadgeColor = (type: string) => {
    switch (type) {
      case "diagnosis":
        return "bg-primary/10 text-primary border-primary";
      case "medication":
        return "bg-secondary/10 text-secondary border-secondary";
      case "allergy":
        return "bg-destructive/10 text-destructive border-destructive";
      case "immunization":
        return "bg-accent/10 text-accent border-accent";
      case "procedure":
        return "bg-warning/10 text-warning border-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredRecords = activeTab === "all" 
    ? records 
    : records.filter(r => r.record_type === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Medical Records</h2>
          <p className="text-sm text-muted-foreground">Complete medical history and documentation</p>
        </div>
        {canAddRecords && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Record Type</Label>
                  <Select value={recordType} onValueChange={setRecordType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_TYPES.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Type 2 Diabetes Diagnosis"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Occurred</Label>
                  <Input
                    type="date"
                    value={dateOccurred}
                    onChange={(e) => setDateOccurred(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Detailed notes about this record..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleAddRecord}
                  disabled={isSaving}
                  className="w-full bg-gradient-primary shadow-primary"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Record
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs Filter */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {RECORD_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredRecords.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No medical records found.
                  {canAddRecords && <><br />Add the first record for this patient.</>}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getRecordBadgeColor(record.record_type)}`}>
                        {getRecordIcon(record.record_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-card-foreground">{record.title}</h3>
                          <Badge variant="outline" className={getRecordBadgeColor(record.record_type)}>
                            {RECORD_TYPES.find(r => r.value === record.record_type)?.label}
                          </Badge>
                        </div>
                        {record.description && (
                          <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {record.date_occurred && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Occurred: {format(new Date(record.date_occurred), "PPP")}
                            </span>
                          )}
                          <span>
                            Recorded: {format(new Date(record.created_at), "PPP")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
