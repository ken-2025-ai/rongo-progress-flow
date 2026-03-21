import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Info,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

const SEMINAR_LEVELS = [
  {
    id: "DEPT_SEMINAR",
    label: "Department Seminar",
    description: "First presentation to your department board",
    requiredStage: "DEPT_SEMINAR_PENDING",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "SCHOOL_SEMINAR",
    label: "School Seminar",
    description: "Present to the school examination board",
    requiredStage: "SCHOOL_SEMINAR_PENDING",
    badgeClass: "bg-secondary/10 text-secondary border-secondary/20",
  },
] as const;

const SEMINAR_DAY = 4; // Thursday

function getNextThursdays(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let d = new Date(today);
  const currentDay = d.getDay();
  const daysUntilThursday = (SEMINAR_DAY - currentDay + 7) % 7;
  // If today is Thursday, start from next week (same-week bookings typically locked)
  const offset = daysUntilThursday === 0 ? 7 : daysUntilThursday;
  d.setDate(d.getDate() + offset);

  for (let i = 0; i < count; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }

  return dates;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SeminarBooking() {
  const { user } = useRole();
  const [student, setStudent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: sData, error: sErr } = await supabase
        .from("students")
        .select("id, registration_number, current_stage")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sErr) throw sErr;
      setStudent(sData || null);

      if (sData) {
        const { data: bData, error: bErr } = await supabase
          .from("seminar_bookings")
          .select("id, seminar_level, requested_date, approved_date, status, notes, created_at")
          .eq("student_id", sData.id)
          .order("created_at", { ascending: false });

        if (bErr) throw bErr;
        setBookings(bData || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load your booking data.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const eligibleLevel = SEMINAR_LEVELS.find(
    (l) => student?.current_stage === l.requiredStage
  );

  const hasExistingBooking = (levelId: string) =>
    bookings.some(
      (b) => b.seminar_level === levelId && ["PENDING", "APPROVED"].includes(b.status)
    );

  const existingBookingForLevel = (levelId: string) =>
    bookings.find((b) => b.seminar_level === levelId);

  const availableDates = getNextThursdays(10);

  const handleSubmit = async () => {
    if (!student || !selectedDate || !selectedLevel) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("seminar_bookings").insert({
        student_id: student.id,
        seminar_level: selectedLevel,
        requested_date: selectedDate.toISOString().split("T")[0],
        status: "PENDING",
      });

      if (error) throw error;

      toast.success("Booking request submitted", {
        description: `Your ${SEMINAR_LEVELS.find((l) => l.id === selectedLevel)?.label} request for ${formatDateFull(selectedDate)} has been sent. The coordinator will confirm your slot.`,
      });

      setSelectedDate(null);
      setSelectedLevel(null);
      fetchData();
    } catch (err: any) {
      toast.error("Request failed", {
        description: err.message?.includes("duplicate")
          ? "You already have a booking for this seminar level."
          : err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    );
  }

  if (!student) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <AlertCircle className="text-muted-foreground mb-4" size={48} />
        <h3 className="text-lg font-bold text-foreground">Student profile not found</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Your account is not linked to a student record. Contact your department to complete registration.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-8"
    >
      {/* Status header */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-border bg-card p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CalendarCheck className="text-primary" size={24} />
              Seminar booking
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Request a slot for your Department or School seminar presentation.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current stage
            </span>
            <Badge
              variant="outline"
              className="text-xs font-semibold capitalize"
            >
              {student.current_stage?.replace(/_/g, " ") ?? "—"}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Your bookings */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock size={18} />
            Your bookings
          </h3>

          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <CalendarDays className="mx-auto text-muted-foreground/50 mb-3" size={32} />
              <p className="text-sm font-medium text-muted-foreground">
                No seminar bookings yet
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Use the form on the right to request a slot.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold mb-2 ${
                          b.seminar_level === "SCHOOL_SEMINAR"
                            ? "bg-secondary/10 text-secondary border-secondary/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {b.seminar_level?.replace(/_/g, " ")}
                      </Badge>
                      <p className="text-sm font-medium text-foreground">
                        {b.approved_date
                          ? formatDateFull(new Date(b.approved_date))
                          : formatDateFull(new Date(b.requested_date))}
                      </p>
                      {b.approved_date && b.requested_date !== b.approved_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested: {formatDateShort(new Date(b.requested_date))}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] font-semibold ${
                        b.status === "APPROVED"
                          ? "bg-success/10 text-success border-success/20"
                          : b.status === "REJECTED"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {b.status}
                    </Badge>
                  </div>
                  {b.status === "REJECTED" && b.notes && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                      {b.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 flex gap-3">
            <Info className="shrink-0 text-primary mt-0.5" size={18} />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">How it works</p>
              <p>
                Seminars are held on Thursdays. Pick a preferred date and submit a request.
                Your coordinator will confirm or propose an alternative.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: Booking form */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          {!eligibleLevel ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2
                className={`mb-4 ${
                  student.current_stage?.includes("COMPLETED") || student.current_stage === "COMPLETED"
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
                size={48}
              />
              <h3 className="text-lg font-bold text-foreground">
                {student.current_stage?.includes("BOOKED")
                  ? "Seminar already scheduled"
                  : student.current_stage?.includes("COMPLETED") || student.current_stage === "COMPLETED"
                    ? "All seminar stages complete"
                    : "Complete previous stage first"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                {student.current_stage?.includes("BOOKED")
                  ? "Your coordinator will confirm the date. Check your bookings above."
                  : student.current_stage?.includes("COMPLETED") || student.current_stage === "COMPLETED"
                    ? "You have completed the seminar requirements for this programme."
                    : "Department Seminar must be completed before booking School Seminar."}
              </p>
            </div>
          ) : hasExistingBooking(eligibleLevel.id) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarCheck className="text-primary mb-4" size={48} />
              <h3 className="text-lg font-bold text-foreground">Request pending</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                You already have a {eligibleLevel.label} request. Your coordinator will
                review and confirm your slot.
              </p>
              {existingBookingForLevel(eligibleLevel.id) && (
                <p className="text-sm font-medium text-foreground mt-4">
                  Requested: {formatDateFull(new Date(existingBookingForLevel(eligibleLevel.id)!.requested_date))}
                </p>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
                <MapPin size={18} />
                Request {eligibleLevel.label}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {eligibleLevel.description}. Select your preferred Thursday below.
              </p>

              {/* Date selection */}
              <div className="space-y-3 mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preferred date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableDates.map((d) => {
                    const isSelected =
                      selectedDate?.toDateString() === d.toDateString();
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <span className="block font-semibold">{formatDateShort(d)}</span>
                        <span className="text-xs text-muted-foreground">
                          {d.getDate()} {d.toLocaleDateString("en-GB", { month: "short" })} {d.getFullYear()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {selectedDate
                    ? `Selected: ${formatDateFull(selectedDate)}`
                    : "Choose a date above"}
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedDate || isSubmitting}
                  className="font-semibold"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    <ArrowRight className="mr-2" size={18} />
                  )}
                  Submit request
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
