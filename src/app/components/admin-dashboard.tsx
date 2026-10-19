import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DoctorList, Doctor } from "./doctor-list";
import { DetailedPatientFormData } from "./detailed-patient-form";
import { Badge } from "./ui/badge";
import { Users, UserCheck, UserX, ClipboardList, CheckCircle, XCircle } from "lucide-react";
import { Button } from "./ui/button";

interface AdminDashboardProps {
  doctors: Doctor[];
  submissions: DetailedPatientFormData[];
  permissions: any[];
  onToggleDoctorStatus: (doctorId: string) => void;
  onApproveDoctor: (permissionId: string) => void;
  onRejectDoctor: (permissionId: string) => void;
}

export function AdminDashboard({
  doctors,
  submissions,
  permissions,
  onToggleDoctorStatus,
  onApproveDoctor,
  onRejectDoctor,
}: AdminDashboardProps) {
  const onlineDoctors = doctors.filter((d) => d.isOnline).length;
  const offlineDoctors = doctors.filter((d) => !d.isOnline).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Online Doctors
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onlineDoctors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Offline Doctors
            </CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {offlineDoctors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {permissions.filter(p => p.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Doctor Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {permissions.filter(p => p.status === 'pending').map((permission) => (
                <div
                  key={permission.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{permission.name}</h3>
                      <p className="text-sm text-gray-600">{permission.email}</p>
                      <p className="text-xs text-gray-500">
                        Requested: {new Date(permission.requested_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApproveDoctor(permission.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRejectDoctor(permission.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DoctorList doctors={doctors} onToggleStatus={onToggleDoctorStatus} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-gray-500 italic">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {submissions.slice().reverse().slice(0, 10).map((submission, index) => {
                const doctor = doctors.find(
                  (d) => d.id === submission.assignedDoctorId
                );
                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{submission.name}</h3>
                        <p className="text-sm text-gray-600">
                          {submission.age} years • {submission.gender}
                        </p>
                      </div>
                      <Badge variant="outline">
                        Assigned to: Dr. {doctor?.name || "Unknown"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Issue:</span>{" "}
                      {submission.issue}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Started: {new Date(submission.issueStartDate).toLocaleDateString()}</span>
                      <span>Duration: {submission.issueDuration}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Submitted: {submission.submittedAt.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}