import { useRole } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/AppLayout";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { SupervisorDashboard } from "@/components/dashboards/SupervisorDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { DeanDashboard } from "@/components/dashboards/DeanDashboard";
import { PanelDashboard } from "@/components/dashboards/PanelDashboard";
import { SuperAdminDashboard } from "@/components/dashboards/SuperAdminDashboard";
import { StudentRegistry } from "@/components/dashboards/StudentRegistry";
import { StaffRegistry } from "@/components/dashboards/StaffRegistry";
import { useLocation } from "react-router-dom";
import { ResearchJourney } from "@/components/student/ResearchJourney";
import { SeminarBooking } from "@/components/student/SeminarBooking";
import { SeminarFeedback } from "@/components/student/SeminarFeedback";
import { SubmitThesis } from "@/components/student/SubmitThesis";
import { ExaminationStatus } from "@/components/student/ExaminationStatus";
import { AcademicProfile } from "@/components/student/AcademicProfile";
import { ProgressReportsSubmission } from "@/components/student/ProgressReportsSubmission";
import { AcademicUpdates } from "@/components/shared/AcademicUpdates";
import { AccountSettings } from "@/components/shared/AccountSettings";
import { MyStudents } from "@/components/supervisor/MyStudents";
import { SeminarReadiness } from "@/components/supervisor/SeminarReadiness";
import { CorrectionsVerification } from "@/components/supervisor/CorrectionsVerification";
import { ProgressReportsReview } from "@/components/supervisor/ProgressReportsReview";
import { ThesisExams } from "@/components/supervisor/ThesisExams";
import { SeminarBookingRequests } from "@/components/admin/SeminarBookingRequests";
import { SeminarSessions } from "@/components/admin/SeminarSessions";
import { StudentProgressControl } from "@/components/admin/StudentProgressControl";
import { DepartmentDecisions } from "@/components/admin/DepartmentDecisions";
import { SchoolSeminarQueue } from "@/components/school_admin/SchoolSeminarQueue";
import { SchoolSeminarSchedule } from "@/components/school_admin/SchoolSeminarSchedule";
import { SchoolDecisions } from "@/components/school_admin/SchoolDecisions";
import { ThesisReadinessCheck } from "@/components/school_admin/ThesisReadinessCheck";
import { CandidatesReady } from "@/components/dean/CandidatesReady";
import { ExaminerAssignment } from "@/components/dean/ExaminerAssignment";
import { VivaScheduling } from "@/components/dean/VivaScheduling";
import { ExaminationDecisions } from "@/components/dean/ExaminationDecisions";
import { FinalClearance } from "@/components/dean/FinalClearance";
import { MyEvaluations } from "@/components/panel/MyEvaluations";
import { PanelSchedule } from "@/components/panel/PanelSchedule";
import { SubmittedEvaluations } from "@/components/panel/SubmittedEvaluations";
import { AcademicStructure } from "@/components/dashboards/AcademicStructure";
import { RoleAssignment } from "@/components/dashboards/RoleAssignment";
import { WorkflowMonitor } from "@/components/dashboards/WorkflowMonitor";
import { SystemLogs } from "@/components/dashboards/SystemLogs";
import { motion, AnimatePresence } from "framer-motion";

const DASHBOARD_TITLES: Record<string, string> = {
  "/": "My Research Overview",
  "/profile": "My Academic Profile",
  "/journey": "Research Journey",
  "/booking": "Book Seminar Presentation",
  "/feedback": "Seminar Feedback",
  "/corrections": "Review & Fix Corrections",
  "/reports": "Progress Reports Submission",
  "/submit-thesis": "Submit Thesis",
  "/examination-status": "Examination Status",
  "/updates": "Academic Updates",
  "/settings": "Account Settings",
};

const SUPERVISOR_TITLES: Record<string, string> = {
  "/": "Supervisor Command Center",
  "/profile": "My Profile",
  "/students": "My Students",
  "/readiness": "Seminar Readiness",
  "/verification": "Corrections Verification",
  "/reports-review": "Progress Reports Review",
  "/thesis-exams": "Thesis & Examination Board",
};

const ADMIN_TITLES: Record<string, string> = {
  "/": "Department Coordinator Overview",
  "/profile": "My Profile",
  "/booking-requests": "Seminar Booking Requests",
  "/sessions": "Live Seminar Sessions",
  "/progress-control": "Student Progress Control",
  "/decisions": "Historical Decisions",
};

const SCHOOL_ADMIN_TITLES: Record<string, string> = {
  "/": "School Coordinator Overview",
  "/profile": "My Profile",
  "/school-queue": "School Seminar Queue",
  "/school-sessions": "Third Thursday Schedule",
  "/school-decisions": "School Decisions",
  "/thesis-clearance": "Thesis Readiness Check",
};

const DEAN_TITLES: Record<string, string> = {
  "/": "PG Dean Institutional Overview",
  "/profile": "My Profile",
  "/dean-queue": "Candidates Ready for Examination",
  "/examiner-assignment": "Examiner Assignment",
  "/viva-scheduling": "Viva Voce Scheduling",
  "/viva-decisions": "Examination Decisions",
  "/final-clearance": "Final Clearance & Graduation",
};

const PANEL_TITLES: Record<string, string> = {
  "/": "Assessment Panel Briefing",
  "/profile": "My Profile",
  "/evaluations": "Academic Review Console",
  "/panel-schedule": "Upcoming Viva Sessions",
  "/submitted-evaluations": "Submitted Evaluations",
};

const SUPER_ADMIN_TITLES: Record<string, string> = {
  "/": "System Governance Overview",
  "/student-registry": "Student Registry Engine",
  "/staff-registry": "Staff Role Provisioning",
  "/academic-structure": "Platform Academic Structure",
  "/role-assignment": "Authorization Console",
  "/workflow-monitor": "Global Workflow Monitor",
  "/system-logs": "Infrastructure Audit Logs",
  "/settings": "Global Admin Settings",
};

const BRAND_PALETTE = {
  navy: "#194973",
  cyan: "#14B5D9",
  gold: "#F2C335",
  amber: "#BF8C2C",
};

const ROLE_SPECIFIC_TITLES = {
  supervisor: "Supervisor Command Center",
  panel: "Assessment Panel Briefing",
  admin: "Department Coordinator Overview",
  school_admin: "School Coordinator Overview",
  dean: "PG Dean Institutional Overview",
  super_admin: "System Governance Portal",
};

export default function DashboardCommandCenter() {
  const { currentRole, user } = useRole();
  const location = useLocation();
  const path = location.pathname;

  const getTitle = () => {
    if (currentRole === "student") return DASHBOARD_TITLES[path] || "Research Portal";
    if (currentRole === "supervisor") return SUPERVISOR_TITLES[path] || "Supervisor Dashboard";
    if (currentRole === "admin") return ADMIN_TITLES[path] || "Coordinator Dashboard";
    if (currentRole === "school_admin") return SCHOOL_ADMIN_TITLES[path] || "School Dashboard";
    if (currentRole === "dean") return DEAN_TITLES[path] || "PG Dean Dashboard";
    if (currentRole === "panel") return PANEL_TITLES[path] || "Evaluation Panel";
    if (currentRole === "super_admin") return SUPER_ADMIN_TITLES[path] || "System Governance Portal";
    
    return ROLE_SPECIFIC_TITLES[currentRole as keyof typeof ROLE_SPECIFIC_TITLES] || "Dashboard";
  };

  const renderContent = () => {
    if (currentRole === "student") {
      switch (path) {
        case "/": return <StudentDashboard />;
        case "/profile": return <AcademicProfile />;
        case "/journey": return <ResearchJourney />;
        case "/booking": return <SeminarBooking />;
        case "/feedback": return <SeminarFeedback />;
        case "/submit-thesis": return <SubmitThesis />;
        case "/examination-status": return <ExaminationStatus />;
        case "/corrections": return <SeminarFeedback />; 
        case "/reports": return <ProgressReportsSubmission />;
        case "/updates": return <AcademicUpdates />;
        case "/settings": return <AccountSettings />;
        default: return (
           <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-3xl" style={{ background: "rgba(25, 73, 115, 0.08)", borderColor: "rgba(20, 181, 217, 0.35)" }}>
             <div className="p-4 rounded-full mb-4" style={{ background: "rgba(242, 195, 53, 0.15)", color: BRAND_PALETTE.amber }}><span className="text-4xl">🚀</span></div>
             <h2 className="text-xl font-bold" style={{ color: BRAND_PALETTE.navy }}>Section In Final Polish</h2>
             <p className="mt-2 max-w-md" style={{ color: "#5f6a7d" }}>Our architects are putting the final touches on <span className="font-bold italic" style={{ color: BRAND_PALETTE.navy }}>{DASHBOARD_TITLES[path]}</span>.</p>
           </div>
        );
      }
    }

    if (currentRole === "supervisor") {
       switch (path) {
         case "/": return <SupervisorDashboard />;
         case "/students": return <MyStudents />;
         case "/readiness": return <SeminarReadiness />;
         case "/verification": return <CorrectionsVerification />;
         case "/reports-review": return <ProgressReportsReview />;
         case "/thesis-exams": return <ThesisExams />;
         
         // Shared Components
         case "/profile": return <AcademicProfile />;
         case "/journey": return <ResearchJourney />;
         case "/feedback": return <SeminarFeedback />;
         case "/corrections": return <SeminarFeedback />;
         case "/reports": return <ProgressReportsSubmission />;
         case "/submit-thesis": return <SubmitThesis />;
         case "/examination-status": return <ExaminationStatus />;
         case "/updates": return <AcademicUpdates />;
         case "/settings": return <AccountSettings />;
         
         default: return (
           <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-3xl" style={{ background: "rgba(25, 73, 115, 0.08)", borderColor: "rgba(20, 181, 217, 0.35)" }}>
             <div className="p-4 rounded-full mb-4" style={{ background: "rgba(242, 195, 53, 0.15)", color: BRAND_PALETTE.amber }}><span className="text-4xl">🚀</span></div>
             <h2 className="text-xl font-bold" style={{ color: BRAND_PALETTE.navy }}>Section In Final Polish</h2>
             <p className="mt-2 max-w-md" style={{ color: "#5f6a7d" }}>Our architects are putting the final touches on <span className="font-bold italic" style={{ color: BRAND_PALETTE.navy }}>{DASHBOARD_TITLES[path] || SUPERVISOR_TITLES[path]}</span>.</p>
           </div>
         );
       }
    }

    if (currentRole === "admin") {
       switch (path) {
         case "/": return <AdminDashboard />;
         case "/booking-requests": return <SeminarBookingRequests />;
         case "/sessions": return <SeminarSessions />;
         case "/progress-control": return <StudentProgressControl />;
         case "/decisions": return <DepartmentDecisions />;
         default: return <AdminDashboard />;
       }
    }

    if (currentRole === "school_admin") {
       switch (path) {
         case "/school-queue": return <SchoolSeminarQueue />;
         case "/school-sessions": return <SchoolSeminarSchedule />;
         case "/school-decisions": return <SchoolDecisions />;
         case "/thesis-clearance": return <ThesisReadinessCheck />;
         default: return <AdminDashboard />;
       }
    }

    if (currentRole === "dean") {
       switch (path) {
         case "/dean-queue": return <CandidatesReady />;
         case "/examiner-assignment": return <ExaminerAssignment />;
         case "/viva-scheduling": return <VivaScheduling />;
         case "/viva-decisions": return <ExaminationDecisions />;
         case "/final-clearance": return <FinalClearance />;
         default: return <DeanDashboard />;
       }
    }

    if (currentRole === "panel") {
       switch (path) {
         case "/evaluations": return <MyEvaluations />;
         case "/panel-schedule": return <PanelSchedule />;
         case "/submitted-evaluations": return <SubmittedEvaluations />;
         default: return <PanelDashboard />;
       }
    }

    if (currentRole === "super_admin") {
       switch (path) {
         case "/": return <SuperAdminDashboard />;
         case "/student-registry": return <StudentRegistry />;
         case "/staff-registry": return <StaffRegistry />;
         case "/academic-structure": return <AcademicStructure />;
         case "/role-assignment": return <RoleAssignment />;
         case "/workflow-monitor": return <WorkflowMonitor />;
         case "/system-logs": return <SystemLogs />;
         case "/settings": return <AccountSettings />;
         default: return (
           <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-red-500/30 rounded-3xl bg-red-950/10">
             <div className="p-4 bg-red-500/20 rounded-full text-red-500 mb-4"><span className="text-4xl">⚙️</span></div>
             <h2 className="text-xl font-bold text-foreground">Governance Node Offline</h2>
             <p className="text-muted-foreground mt-2 max-w-md">Our architects are putting the final touches on <span className="font-bold text-red-400 italic font-mono uppercase">{SUPER_ADMIN_TITLES[path]}</span> in some departments.</p>
           </div>
         );
       }
    }

    // Fallback for roles not explicitly handled above, or default dashboard
    return <StudentDashboard />;
  };

  return (
    <AppLayout>
      <div className="mb-5 px-1">
        <motion.h1 
          key={path}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold tracking-tight"
          style={{ color: BRAND_PALETTE.navy }}
        >
          {getTitle()}
        </motion.h1>
      </div>

      <div
        className="mb-5 p-2 rounded-md border text-xs font-bold uppercase tracking-widest"
        style={{ backgroundColor: "rgba(20, 181, 217, 0.1)", borderColor: "rgba(20, 181, 217, 0.4)", color: BRAND_PALETTE.navy }}
      >
        Current Activity
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={path + currentRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
