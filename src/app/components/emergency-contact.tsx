import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Doctor } from "./doctor-list";
import { ArrowLeft, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";

interface EmergencyContactProps {
  doctors: Doctor[];
  onBack: () => void;
}

export function EmergencyContact({ doctors, onBack }: EmergencyContactProps) {
  const onlineDoctors = doctors.filter((d) => d.isOnline);

  const handleContactDoctor = (doctorName: string) => {
    toast.success(`Connecting you with Dr. ${doctorName}...`, {
      description: "Please wait while we establish the connection.",
    });
  };

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

      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription className="text-red-800">
            Online doctors available for immediate consultation
          </CardDescription>
        </CardHeader>
      </Card>

      {onlineDoctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No doctors are currently online</p>
            <p className="text-sm text-gray-400">
              Please try again later or fill the form to be contacted once a doctor is available
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onlineDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <User className="w-6 h-6 text-green-800" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>doctor{doctor.id}@ayurvedacrm.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>+91 {9000000000 + parseInt(doctor.id)}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-green-800 hover:bg-green-700"
                  onClick={() => handleContactDoctor(doctor.name)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
