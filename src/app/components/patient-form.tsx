import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Doctor } from "./doctor-list";
import { toast } from "sonner";
import { User, Mail, Phone, FileText } from "lucide-react";

interface PatientFormProps {
  doctors: Doctor[];
  onSubmit: (formData: PatientFormData) => void;
}

export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  symptoms: string;
  assignedDoctorId: string;
  submittedAt: Date;
}

export function PatientForm({ doctors, onSubmit }: PatientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    symptoms: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    const patientData: PatientFormData = {
      ...formData,
      assignedDoctorId: assignedDoctor.id,
      submittedAt: new Date(),
    };

    onSubmit(patientData);

    toast.success(
      `Form submitted successfully! Assigned to Dr. ${assignedDoctor.name}`,
      {
        description: `You will be contacted shortly.`,
      }
    );

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      symptoms: "",
    });
  };

  const onlineDoctorsCount = doctors.filter((d) => d.isOnline).length;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Patient Registration Form</CardTitle>
          <CardDescription>
            Fill out the form below and you'll be assigned to an available
            doctor
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
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
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
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Symptoms / Reason for Visit
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Describe your symptoms or reason for consultation"
                value={formData.symptoms}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                rows={5}
                required
              />
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
