import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { User } from "lucide-react";

export interface Doctor {
  id: string;
  name: string;
  isOnline: boolean;
  assignedPatients: number;
}

interface DoctorListProps {
  doctors: Doctor[];
  onToggleStatus: (doctorId: string) => void;
}

export function DoctorList({ doctors, onToggleStatus }: DoctorListProps) {
  const onlineDoctors = doctors.filter(d => d.isOnline);
  const offlineDoctors = doctors.filter(d => !d.isOnline);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-green-800">
          Online Doctors ({onlineDoctors.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onlineDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
        {onlineDoctors.length === 0 && (
          <p className="text-gray-500 italic">No doctors online</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-600">
          Offline Doctors ({offlineDoctors.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offlineDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DoctorCard({
  doctor,
  onToggleStatus,
}: {
  doctor: Doctor;
  onToggleStatus: (doctorId: string) => void;
}) {
  return (
    <Card className={doctor.isOnline ? "border-green-500 border-2" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <User className="w-6 h-6 text-green-800" />
            </div>
            <div>
              <CardTitle className="text-lg">{doctor.name}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={doctor.isOnline ? "default" : "secondary"}>
              {doctor.isOnline ? "Online" : "Offline"}
            </Badge>
            <span className="text-sm text-gray-600">
              {doctor.assignedPatients} patients
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Switch
              checked={doctor.isOnline}
              onCheckedChange={() => onToggleStatus(doctor.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
