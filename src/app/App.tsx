import { useEffect, useState } from "react";
import { Navbar } from "./components/navbar";
import { AdminDashboard } from "./components/admin-dashboard";
import { DoctorPortal } from "./components/doctor-portal";
import { PatientPortal } from "./components/patient-portal";
import {
  DetailedPatientForm,
  DetailedPatientFormData,
} from "./components/detailed-patient-form";
import { EmergencyContact } from "./components/emergency-contact";
import { Doctor } from "./components/doctor-list";
import { AuthModal } from "./components/auth-modal";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { ChatInterface, ChatMessage } from "./components/chat-interface";
import { getUsersByRole, restoreAuth, setCurrentUser, getAdminPermissions, approveDoctor, rejectDoctor } from "./database";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<
    "admin" | "doctor" | "patient"
  >("patient");
  const [userData, setUserData] = useState<any>(null);
  const [patientView, setPatientView] = useState<
    "portal" | "fill-form" | "emergency" | "chat"
  >("portal");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatSubmissionId, setCurrentChatSubmissionId] = useState<string | null>(null);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [submissions, setSubmissions] = useState<
    DetailedPatientFormData[]
  >([]);

  const [permissions, setPermissions] = useState<any[]>([]);

  const handleToggleDoctorStatus = (doctorId: string) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === doctorId
          ? { ...doctor, isOnline: !doctor.isOnline }
          : doctor,
      ),
    );
  };

  const handlePatientFormSubmit = (
    formData: DetailedPatientFormData,
  ) => {
    // Generate unique ID for submission
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Find assigned doctor name
    const assignedDoctor = doctors.find(d => d.id === formData.assignedDoctorId);
    const doctorName = assignedDoctor?.name || "Doctor";

    const completeFormData: DetailedPatientFormData = {
      ...formData,
      id: submissionId,
      patientEmail: userData?.email || "",
      assignedDoctorName: doctorName,
    };

    // Add submission to list
    setSubmissions((prev) => [...prev, completeFormData]);

    // Increment assigned patients count for the doctor
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === formData.assignedDoctorId
          ? {
              ...doctor,
              assignedPatients: doctor.assignedPatients + 1,
            }
          : doctor,
      ),
    );

    // Return to patient portal after submission
    setPatientView("portal");
  };

  const handleSendMessage = (message: string) => {
    if (!currentChatSubmissionId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      submissionId: currentChatSubmissionId,
      senderId: userType === "doctor" ? userData?.id : userData?.name || "patient",
      senderName: userType === "doctor" ? userData?.name : userData?.name || "Patient",
      senderType: userType === "doctor" ? "doctor" : "patient",
      message: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
  };

  const handleAuthSuccess = (
    type: "admin" | "doctor" | "patient",
    data?: any,
  ) => {
    setUserType(type);
    setUserData(data);
    setIsAuthenticated(true);
    if (data) {
      setCurrentUser(data);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType("patient");
    setUserData(null);
    setPatientView("portal");
    setDoctorChatView(null);
    setCurrentChatSubmissionId(null);
    setCurrentUser(null);
  };

  const [doctorChatView, setDoctorChatView] = useState<{
    submissionId: string;
    patientName: string;
  } | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const currentUser = await restoreAuth();
      if (currentUser) {
        setUserType(currentUser.role);
        setUserData(currentUser);
        setIsAuthenticated(true);
      }

      try {
        const doctorUsers = await getUsersByRole("doctor");
        setDoctors(
          doctorUsers.map((user) => ({
            id: user.id,
            name: user.name,
            isOnline: Boolean(user.is_online),
            assignedPatients: 0,
          })),
        );
      } catch (error) {
        console.error("Unable to load doctors", error);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (userType === "admin") {
      const loadPermissions = async () => {
        try {
          const perms = await getAdminPermissions();
          setPermissions(perms);
        } catch (error) {
          console.error("Unable to load permissions", error);
        }
      };
      loadPermissions();
    }
  }, [userType]);

  const handleApproveDoctor = async (permissionId: string) => {
    try {
      await approveDoctor(permissionId);
      toast.success("Doctor approved successfully!");
      // Refresh permissions
      const perms = await getAdminPermissions();
      setPermissions(perms);
      // Refresh doctors list
      const doctorUsers = await getUsersByRole("doctor");
      setDoctors(
        doctorUsers.map((user) => ({
          id: user.id,
          name: user.name,
          isOnline: Boolean(user.is_online),
          assignedPatients: 0,
        })),
      );
    } catch (error: any) {
      console.error("Failed to approve doctor", error);
      toast.error(error?.message || "Failed to approve doctor");
    }
  };

  const handleRejectDoctor = async (permissionId: string) => {
    try {
      await rejectDoctor(permissionId);
      toast.success("Doctor rejected successfully!");
      // Refresh permissions
      const perms = await getAdminPermissions();
      setPermissions(perms);
    } catch (error: any) {
      console.error("Failed to reject doctor", error);
      toast.error(error?.message || "Failed to reject doctor");
    }
  };

  const renderContent = () => {
    if (userType === "admin") {
      return (
        <AdminDashboard
          doctors={doctors}
          submissions={submissions}
          permissions={permissions}
          onToggleDoctorStatus={handleToggleDoctorStatus}
          onApproveDoctor={handleApproveDoctor}
          onRejectDoctor={handleRejectDoctor}
        />
      );
    } else if (userType === "doctor") {
      if (doctorChatView) {
        return (
          <ChatInterface
            submissionId={doctorChatView.submissionId}
            currentUserId={userData?.id || ""}
            currentUserName={userData?.name || "Doctor"}
            currentUserType="doctor"
            otherUserName={doctorChatView.patientName}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setDoctorChatView(null)}
          />
        );
      }
      return (
        <DoctorPortal
          doctorId={userData?.id || "1"}
          doctorName={userData?.name || "Doctor"}
          submissions={submissions}
          onChatClick={(submissionId, patientName) => {
            setCurrentChatSubmissionId(submissionId);
            setDoctorChatView({ submissionId, patientName });
          }}
        />
      );
    } else if (userType === "patient") {
      if (patientView === "portal") {
        return (
          <PatientPortal
            onSelectOption={(option) => {
              if (option === "fill-form") {
                setPatientView("fill-form");
              } else {
                setPatientView("emergency");
              }
            }}
            patientName={userData?.name || ""}
            patientEmail={userData?.email || ""}
            submissions={submissions}
            onChatClick={(submissionId) => {
              setCurrentChatSubmissionId(submissionId);
              setPatientView("chat");
            }}
          />
        );
      } else if (patientView === "fill-form") {
        return (
          <DetailedPatientForm
            doctors={doctors}
            onSubmit={handlePatientFormSubmit}
            onBack={() => setPatientView("portal")}
            patientName={userData?.name || ""}
            patientData={{
              name: userData?.name || "",
              age: userData?.age || "",
              dob: userData?.dob || "",
              gender: userData?.gender || "",
              city: userData?.city || "",
              state: userData?.state || "",
              country: userData?.country || "",
            }}
          />
        );
      } else if (patientView === "emergency") {
        return (
          <EmergencyContact
            doctors={doctors}
            onBack={() => setPatientView("portal")}
          />
        );
      } else if (patientView === "chat" && currentChatSubmissionId) {
        const submission = submissions.find(s => s.id === currentChatSubmissionId);
        return (
          <ChatInterface
            submissionId={currentChatSubmissionId}
            currentUserId={userData?.name || "patient"}
            currentUserName={userData?.name || "Patient"}
            currentUserType="patient"
            otherUserName={submission?.assignedDoctorName || "Doctor"}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setPatientView("portal")}
          />
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        <AuthModal
          isOpen={true}
          onAuthSuccess={handleAuthSuccess}
        />
      ) : (
        <>
          <Navbar
            userType={userType}
            userName={
              userData?.name || userData?.email || "User"
            }
            onLogout={handleLogout}
          />

          <main className="container mx-auto px-4 py-8">
            {renderContent()}
          </main>
        </>
      )}

      <Toaster />
    </div>
  );
}