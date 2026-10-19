import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Doctor } from "./doctor-list";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface PatientData {
  name?: string;
  age?: string | number;
  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface DetailedPatientFormProps {
  doctors: Doctor[];
  onSubmit: (formData: DetailedPatientFormData) => void;
  onBack: () => void;
  patientName: string;
  patientData?: PatientData;
}

export interface DetailedPatientFormData {
  id: string;
  patientEmail: string;
  name: string;
  age: string;
  dob: string;
  gender: string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  issueStartDate: string;
  issue: string;
  peakTime: string;
  otherProblems: string;
  issueDuration: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  submittedAt: Date;
}

type DetailedPatientFormState = Omit<DetailedPatientFormData, "assignedDoctorId" | "submittedAt" | "issueDuration"> & {
  issueDurationYears: string;
  issueDurationMonths: string;
  issueDurationDays: string;
};

const MIN_DOB = "1926-01-01";
const today = new Date().toISOString().split("T")[0];

const formatDateForInput = (value?: string) => {
  if (!value) return "";
  return value.split("T")[0];
};

const normalizeGender = (value?: string) => {
  if (!value) return "";
  const lower = value.trim().toLowerCase();
  return ["male", "female", "other"].includes(lower) ? lower : "";
};

export function DetailedPatientForm({ doctors, onSubmit, onBack, patientName, patientData }: DetailedPatientFormProps) {
  const MAX_AGE = 100;

  const [formData, setFormData] = useState<DetailedPatientFormState>({
    name: patientData?.name || patientName || "",
    age: patientData?.age ? String(patientData.age) : "",
    dob: formatDateForInput(patientData?.dob),
    gender: normalizeGender(patientData?.gender),
    birthTime: "",
    birthCity: patientData?.city || "",
    birthState: patientData?.state || "",
    birthCountry: patientData?.country || "",
    issueStartDate: "",
    issue: "",
    peakTime: "",
    otherProblems: "",
    issueDurationYears: "0",
    issueDurationMonths: "0",
    issueDurationDays: "0",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: patientData?.name || patientName || "",
      age: patientData?.age ? String(patientData.age) : "",
      dob: formatDateForInput(patientData?.dob),
      gender: patientData?.gender || "",
      birthCity: patientData?.city || "",
      birthState: patientData?.state || "",
      birthCountry: patientData?.country || "",
    }));
  }, [patientData, patientName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ageNumber = Number(formData.age);
    const dobDate = new Date(formData.dob);
    const minDobDate = new Date(MIN_DOB);

    if (formData.age && (Number.isNaN(ageNumber) || ageNumber < 0 || ageNumber > MAX_AGE)) {
      toast.error(`Age must be a number between 0 and ${MAX_AGE}.`);
      return;
    }

    if (formData.dob && (isNaN(dobDate.getTime()) || dobDate < minDobDate)) {
      toast.error(`Date of Birth must be ${MIN_DOB} or later.`);
      return;
    }

    if (!formData.gender) {
      toast.error("Please select a gender.");
      return;
    }

    if (!formData.issueStartDate) {
      toast.error("Please select when the issue started.");
      return;
    }

    const issueStartDate = new Date(formData.issueStartDate);
    if (isNaN(issueStartDate.getTime()) || issueStartDate < minDobDate) {
      toast.error(`Issue start date must be ${MIN_DOB} or later.`);
      return;
    }

    const years = Number(formData.issueDurationYears);
    const months = Number(formData.issueDurationMonths);
    const days = Number(formData.issueDurationDays);

    if (
      Number.isNaN(years) || years < 0 ||
      Number.isNaN(months) || months < 0 || months > 11 ||
      Number.isNaN(days) || days < 0 || days > 30
    ) {
      toast.error("Issue duration values must be valid non-negative numbers.");
      return;
    }

    if (years === 0 && months === 0 && days === 0) {
      toast.error("Issue duration cannot be all zeros.");
      return;
    }

    const issueDuration = `${years} years ${months} months ${days} days`;

    // Find online doctors sorted by number of assigned patients
    const onlineDoctors = doctors
      .filter((d) => d.isOnline)
      .sort((a, b) => a.assignedPatients - b.assignedPatients);

    if (onlineDoctors.length === 0) {
      toast.error("No doctors are currently online. Please try again later.");
      return;
    }

    // Assign to doctor with least patients (top online doctor)
    const assignedDoctor = onlineDoctors[0];

    const { issueDurationYears, issueDurationMonths, issueDurationDays, ...remainingFormData } = formData;

    const patientData: DetailedPatientFormData = {
      ...remainingFormData,
      issueDuration,
      assignedDoctorId: assignedDoctor.id,
      submittedAt: new Date(),
    };

    onSubmit(patientData);

    toast.success(
      `Form submitted successfully! Assigned to Dr. ${assignedDoctor.name}`,
      {
        description: `The doctor will review your case and contact you shortly.`,
      }
    );

    // Reset form
    setFormData({
      name: patientName || "",
      age: "",
      dob: "",
      gender: "",
      birthTime: "",
      birthCity: "",
      birthState: "",
      birthCountry: "",
      issueStartDate: "",
      issue: "",
      peakTime: "",
      otherProblems: "",
      issueDurationYears: "0",
      issueDurationMonths: "0",
      issueDurationDays: "0",
    });
  };

  const onlineDoctorsCount = doctors.filter((d) => d.isOnline).length;

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Portal
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Patient Consultation Form</CardTitle>
          <CardDescription>
            Please fill out all the details for better diagnosis and treatment
          </CardDescription>
          <div className="mt-2">
            {onlineDoctorsCount > 0 ? (
              <p className="text-sm text-green-600">
                ✓ {onlineDoctorsCount} doctor{onlineDoctorsCount !== 1 ? "s" : ""}{" "}
                currently available
              </p>
            ) : (
              <p className="text-sm text-red-600">
                ✗ No doctors are currently online
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800 border-b pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    max={MAX_AGE}
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    min={MIN_DOB}
                    max={today}
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Birth Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800 border-b pb-2">
                Birth Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthTime">Time of Birth *</Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) =>
                      setFormData({ ...formData, birthTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthCity">City of Birth *</Label>
                  <Input
                    id="birthCity"
                    placeholder="Enter your birth city"
                    value={formData.birthCity}
                    onChange={(e) =>
                      setFormData({ ...formData, birthCity: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthState">State of Birth *</Label>
                  <Input
                    id="birthState"
                    placeholder="Enter your birth state"
                    value={formData.birthState}
                    onChange={(e) =>
                      setFormData({ ...formData, birthState: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthCountry">Country of Birth *</Label>
                  <Input
                    id="birthCountry"
                    placeholder="Enter your birth country"
                    value={formData.birthCountry}
                    onChange={(e) =>
                      setFormData({ ...formData, birthCountry: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800 border-b pb-2">
                Medical Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueStartDate">When Issue Started *</Label>
                  <Input
                    id="issueStartDate"
                    type="date"
                    min={MIN_DOB}
                    max={today}
                    value={formData.issueStartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueStartDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue">What's the Issue *</Label>
                  <Textarea
                    id="issue"
                    placeholder="Describe your main health concern in detail"
                    value={formData.issue}
                    onChange={(e) =>
                      setFormData({ ...formData, issue: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peakTime">When the Issue Peaks Most (Time in Day) *</Label>
                  <Input
                    id="peakTime"
                    type="time"
                    value={formData.peakTime}
                    onChange={(e) =>
                      setFormData({ ...formData, peakTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>For How Much Time the Issue is Present *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="issueDurationYears">Years</Label>
                      <Input
                        id="issueDurationYears"
                        type="number"
                        min={0}
                        max={100}
                        value={formData.issueDurationYears}
                        onChange={(e) =>
                          setFormData({ ...formData, issueDurationYears: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issueDurationMonths">Months</Label>
                      <Input
                        id="issueDurationMonths"
                        type="number"
                        min={0}
                        max={11}
                        value={formData.issueDurationMonths}
                        onChange={(e) =>
                          setFormData({ ...formData, issueDurationMonths: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issueDurationDays">Days</Label>
                      <Input
                        id="issueDurationDays"
                        type="number"
                        min={0}
                        max={30}
                        value={formData.issueDurationDays}
                        onChange={(e) =>
                          setFormData({ ...formData, issueDurationDays: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherProblems">Any Other Problems</Label>
                  <Textarea
                    id="otherProblems"
                    placeholder="Mention any other health issues or concerns (optional)"
                    value={formData.otherProblems}
                    onChange={(e) =>
                      setFormData({ ...formData, otherProblems: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-800 hover:bg-green-700"
              disabled={onlineDoctorsCount === 0}
            >
              Submit Form
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
