import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DetailedPatientFormData } from "./detailed-patient-form";
import { ScrollArea } from "./ui/scroll-area";
import { ClipboardList, User, Calendar, Clock, AlertCircle, MessageCircle } from "lucide-react";

interface DoctorPortalProps {
  doctorId: string;
  doctorName: string;
  submissions: DetailedPatientFormData[];
  onChatClick: (submissionId: string, patientName: string) => void;
}

export function DoctorPortal({ doctorId, doctorName, submissions, onChatClick }: DoctorPortalProps) {
  const myPatients = submissions.filter((s) => s.assignedDoctorId === doctorId);

  return (
    <div className="space-y-6">
      <div className="bg-green-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, Dr. {doctorName}
        </h1>
        <p className="text-green-100">
          You have {myPatients.length} patient{myPatients.length !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Patient Submissions
            </CardTitle>
            <Badge variant="secondary">{myPatients.length} Total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {myPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No patient submissions yet</p>
              <p className="text-sm">New patients will appear here when they submit forms</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {myPatients.slice().reverse().map((patient, index) => (
                  <Card key={index} className="border-2 hover:border-green-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <User className="w-6 h-6 text-green-800" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{patient.name}</h3>
                            <p className="text-sm text-gray-600">
                              {patient.age} years old • {patient.gender}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">New</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Personal Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(patient.dob).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Birth Time</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {patient.birthTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Birth Place</p>
                          <p className="text-sm">
                            {patient.birthCity}, {patient.birthState}, {patient.birthCountry}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Submitted</p>
                          <p className="text-sm">
                            {patient.submittedAt.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Medical Information */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-red-600 font-medium mb-1">Main Issue</p>
                            <p className="text-sm font-medium">{patient.issue}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              Issue Started
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(patient.issueStartDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              Duration
                            </p>
                            <p className="text-sm font-medium">{patient.issueDuration}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs text-orange-600 font-medium mb-1">
                            Peak Time (Symptoms Worsen)
                          </p>
                          <p className="text-sm font-medium">{patient.peakTime}</p>
                        </div>

                        {patient.otherProblems && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium mb-1">
                              Other Problems
                            </p>
                            <p className="text-sm">{patient.otherProblems}</p>
                          </div>
                        )}
                      </div>

                      {/* Chat Button */}
                      <div className="pt-3 border-t">
                        <Button
                          onClick={() => onChatClick(patient.id, patient.name)}
                          className="w-full bg-green-700 hover:bg-green-600"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat with Patient
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
