import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Phone, MessageCircle } from "lucide-react";
import { DetailedPatientFormData } from "./detailed-patient-form";

interface PatientPortalProps {
  onSelectOption: (option: "fill-form" | "emergency") => void;
  patientName: string;
  patientEmail: string;
  submissions: DetailedPatientFormData[];
  onChatClick: (submissionId: string) => void;
}

export function PatientPortal({ onSelectOption, patientName, patientEmail, submissions, onChatClick }: PatientPortalProps) {
  const mySubmissions = submissions.filter(sub => sub.patientEmail === patientEmail);
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          Welcome to Patient Portal
        </h1>
        <p className="text-gray-600">
          Choose an option below to proceed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectOption("fill-form")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="w-8 h-8 text-green-800" />
              </div>
              <CardTitle className="text-xl">Fill the Form</CardTitle>
            </div>
            <CardDescription>
              Complete your medical consultation form and get assigned to an available doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-800 hover:bg-green-700" onClick={() => onSelectOption("fill-form")}>
              Start Form
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectOption("emergency")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-3 rounded-full">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Contact Doctor on Emergency</CardTitle>
            </div>
            <CardDescription>
              Need immediate assistance? Contact an online doctor right away
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full" onClick={() => onSelectOption("emergency")}>
              Emergency Contact
            </Button>
          </CardContent>
        </Card>
      </div>

      {mySubmissions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Your Consultations
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {mySubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Consultation with Dr. {submission.assignedDoctorName}
                      </CardTitle>
                      <CardDescription>
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => onChatClick(submission.id)}
                      className="bg-green-700 hover:bg-green-600"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Doctor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p><strong>Issue:</strong> {submission.issue}</p>
                    {submission.otherProblems && (
                      <p className="mt-1"><strong>Other Problems:</strong> {submission.otherProblems}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
