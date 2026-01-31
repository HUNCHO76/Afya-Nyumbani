import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  ClipboardList,
  Plus,
  Loader2,
  Target,
  CheckCircle,
  Calendar,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface CarePlan {
  id: string;
  title: string;
  description: string | null;
  goals: string[] | null;
  interventions: string[] | null;
  start_date: string;
  end_date: string | null;
  status: string;
  review_date: string | null;
  created_at: string;
}

interface CarePlansProps {
  patientId: string | null;
  userRole: "admin" | "practitioner" | "client";
  userId: string;
}

export const CarePlans = ({ patientId, userRole, userId }: CarePlansProps) => {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalsText, setGoalsText] = useState("");
  const [interventionsText, setInterventionsText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reviewDate, setReviewDate] = useState("");

  const canManagePlans = userRole === "practitioner" || userRole === "admin";

  useEffect(() => {
    if (patientId) {
      fetchCarePlans();
    }
  }, [patientId]);

  const fetchCarePlans = async () => {
    if (!patientId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("care_plans")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCarePlans(data || []);
    } catch (error) {
      console.error("Error fetching care plans:", error);
      toast({
        title: "Error",
        description: "Failed to load care plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!patientId || !title || !startDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const goals = goalsText.split("\n").filter(g => g.trim());
      const interventions = interventionsText.split("\n").filter(i => i.trim());

      const { error } = await supabase.from("care_plans").insert({
        patient_id: patientId,
        created_by: userId,
        title,
        description: description || null,
        goals: goals.length > 0 ? goals : null,
        interventions: interventions.length > 0 ? interventions : null,
        start_date: startDate,
        end_date: endDate || null,
        review_date: reviewDate || null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Care Plan Created",
        description: "Care plan has been created successfully",
      });
      
      setDialogOpen(false);
      resetForm();
      fetchCarePlans();
    } catch (error) {
      console.error("Error creating care plan:", error);
      toast({
        title: "Error",
        description: "Failed to create care plan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (planId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("care_plans")
        .update({ status: newStatus })
        .eq("id", planId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Care plan marked as ${newStatus}`,
      });
      
      fetchCarePlans();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update care plan status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGoalsText("");
    setInterventionsText("");
    setStartDate("");
    setEndDate("");
    setReviewDate("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Completed</Badge>;
      case "on_hold":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">On Hold</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
          <h2 className="text-xl font-semibold text-card-foreground">Care Plans</h2>
          <p className="text-sm text-muted-foreground">Personalized healthcare goals and interventions</p>
        </div>
        {canManagePlans && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Care Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Care Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Plan Title *</Label>
                  <Input
                    placeholder="e.g., Post-Surgery Recovery Plan"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Overview of the care plan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Review Date</Label>
                  <Input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => setReviewDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Goals (one per line)</Label>
                  <Textarea
                    placeholder="Reduce blood pressure to normal range&#10;Improve mobility and range of motion&#10;Manage pain levels effectively"
                    value={goalsText}
                    onChange={(e) => setGoalsText(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interventions (one per line)</Label>
                  <Textarea
                    placeholder="Daily blood pressure monitoring&#10;Physical therapy exercises 3x weekly&#10;Medication management and education"
                    value={interventionsText}
                    onChange={(e) => setInterventionsText(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreatePlan}
                  disabled={isSaving}
                  className="w-full bg-gradient-primary shadow-primary"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Care Plan
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Care Plans List */}
      {carePlans.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No care plans created yet.
              {canManagePlans && <><br />Create the first care plan for this patient.</>}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {carePlans.map((plan) => (
            <Card key={plan.id} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      {plan.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  </div>
                  {getStatusBadge(plan.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Started: {format(new Date(plan.start_date), "PPP")}
                  </span>
                  {plan.end_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Ends: {format(new Date(plan.end_date), "PPP")}
                    </span>
                  )}
                  {plan.review_date && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Review: {format(new Date(plan.review_date), "PPP")}
                    </span>
                  )}
                </div>

                {/* Goals */}
                {plan.goals && plan.goals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground flex items-center gap-1 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      Goals
                    </h4>
                    <ul className="space-y-1">
                      {plan.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interventions */}
                {plan.interventions && plan.interventions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground flex items-center gap-1 mb-2">
                      <ClipboardList className="w-4 h-4 text-accent" />
                      Interventions
                    </h4>
                    <ul className="space-y-1">
                      {plan.interventions.map((intervention, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-4 h-4 flex items-center justify-center text-xs bg-accent/10 text-accent rounded-full flex-shrink-0">
                            {index + 1}
                          </span>
                          {intervention}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {canManagePlans && plan.status === "active" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(plan.id, "completed")}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(plan.id, "on_hold")}
                    >
                      Hold
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
