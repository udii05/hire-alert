"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Code2,
  Briefcase,
  MapPin,
  Building2,
  Heart,
  Plus,
  X,
  Save,
  Loader2,
  Search,
  Check,
  Pencil,
  Phone,
  Globe,
  Clock,
  Banknote,
  FolderKanban,
  FileText,
  ExternalLink,
  Award,
  Sparkles,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SessionProvider } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  COLLEGES,
  DEGREES,
  BRANCHES,
  SKILLS,
  SKILLS_BY_CATEGORY,
  JOB_ROLES,
  LOCATIONS,
  GRADUATION_YEARS,
  INTEREST_OPTIONS,
} from "@/lib/profile-constants";

const MATCH_THRESHOLD = 75;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  duration: string;
  responsibilities: string;
  technologies: string[];
  achievements: string;
}

interface ProfileData {
  name?: string;
  email?: string;
  // education (legacy)
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number | string;
  cgpa?: number | string;
  skills?: string[];
  preferredRoles?: string[];
  preferredLocations?: string[];
  preferredCompanies?: string[];
  interests?: string[];
  // basic info
  phone?: string;
  city?: string;
  country?: string;
  timeZone?: string;
  nationality?: string;
  workAuthorization?: string;
  visaSponsorshipRequired?: boolean;
  // job preferences
  jobType?: string;
  workMode?: string;
  minSalary?: number | string;
  targetSalary?: number | string;
  noticePeriod?: string;
  earliestJoining?: string;
  willingToRelocate?: boolean;
  // education extras
  specialization?: string;
  university?: string;
  relevantCoursework?: string[];
  // experience
  currentStatus?: string;
  yearsOfExperience?: number | string;
  currentCompany?: string;
  previousCompanies?: string[];
  hasInternships?: boolean;
  hasFreelancing?: boolean;
  hasResearch?: boolean;
  hasTeaching?: boolean;
  hasOpenSource?: boolean;
  experienceEntries?: ExperienceEntry[];
  // technical skills
  programmingLanguages?: string[];
  frameworks?: string[];
  libraries?: string[];
  databases?: string[];
  cloudPlatforms?: string[];
  devopsTools?: string[];
  aiMlTechnologies?: string[];
  dataAnalysisTools?: string[];
  designTools?: string[];
  softSkills?: string[];
  skillProficiency?: Record<string, string>;
  // portfolio
  resumeUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  leetcodeUrl?: string;
  codechefUrl?: string;
  hackerrankUrl?: string;
  kaggleUrl?: string;
  personalWebsite?: string;
}

const EMPTY_PROFILE: ProfileData = {
  name: "",
  college: "",
  degree: "",
  branch: "",
  university: "",
  specialization: "",
  graduationYear: "",
  cgpa: "",
  skills: [],
  preferredRoles: [],
  preferredLocations: [],
  preferredCompanies: [],
  interests: [],
  phone: "",
  city: "",
  country: "",
  timeZone: "",
  nationality: "",
  workAuthorization: "",
  visaSponsorshipRequired: false,
  jobType: "",
  workMode: "",
  minSalary: "",
  targetSalary: "",
  noticePeriod: "",
  earliestJoining: "",
  willingToRelocate: true,
  relevantCoursework: [],
  currentStatus: "",
  yearsOfExperience: "",
  currentCompany: "",
  previousCompanies: [],
  hasInternships: false,
  hasFreelancing: false,
  hasResearch: false,
  hasTeaching: false,
  hasOpenSource: false,
  experienceEntries: [],
  programmingLanguages: [],
  frameworks: [],
  libraries: [],
  databases: [],
  cloudPlatforms: [],
  devopsTools: [],
  aiMlTechnologies: [],
  dataAnalysisTools: [],
  designTools: [],
  softSkills: [],
  skillProficiency: {},
  resumeUrl: "",
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  leetcodeUrl: "",
  codechefUrl: "",
  hackerrankUrl: "",
  kaggleUrl: "",
  personalWebsite: "",
};

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Trainee"];
const WORK_MODES = ["Remote", "Hybrid", "On-site"];
const NOTICE_PERIODS = ["Immediately", "15 days", "30 days", "60 days", "90 days", "Not applicable"];
const CURRENT_STATUSES = ["Student", "Fresher (graduated, looking)", "Employed", "Intern", "Freelancer", "Not looking"];
const TIME_ZONES = [
  "Asia/Kolkata (IST, UTC+5:30)",
  "Asia/Dubai (GST, UTC+4)",
  "Europe/London (GMT, UTC+0)",
  "Europe/Berlin (CET, UTC+1)",
  "America/New_York (EST, UTC-5)",
  "America/Los_Angeles (PST, UTC-8)",
  "Asia/Singapore (SGT, UTC+8)",
  "Australia/Sydney (AEST, UTC+10)",
  "Other",
];
const WORK_AUTHORIZATIONS = [
  "Citizen",
  "Permanent Resident",
  "Student Visa (F-1/OPT/CPT)",
  "Work Visa / H-1B",
  "Other Visa",
  "None / Need Sponsorship",
];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            {title}
            {subtitle && <p className="text-xs font-normal text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ViewField({ label, value, full = false }: { label: string; value?: string | number | null; full?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className={cn("space-y-1", full && "sm:col-span-2")}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground break-words">{String(value)}</p>
    </div>
  );
}

function ViewChips({ label, items, full = false }: { label: string; items?: string[]; full?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="rounded-full text-xs">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ViewBool({ label, value }: { label: string; value?: boolean }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value ? "Yes" : "No"}</p>
    </div>
  );
}

function ViewUrl({ label, value, full = false }: { label: string; value?: string; full?: boolean }) {
  if (!value) return null;
  return (
    <div className={cn("space-y-1", full && "sm:col-span-2")}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
      >
        {value.replace(/^https?:\/\//, "").slice(0, 40)}
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}

function ChipEditor({
  items,
  onChange,
  placeholder,
  suggestions,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  function add(value: string) {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder={placeholder}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="rounded-xl flex-1"
        />
        <Button variant="outline" className="rounded-xl" onClick={() => add(input)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {suggestions && showSuggestions && input && (
        <div className="rounded-lg border border-border bg-card max-h-40 overflow-y-auto">
          {suggestions
            .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !items.includes(s))
            .slice(0, 8)
            .map((s) => (
              <button
                key={s}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(s);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
              >
                {s}
              </button>
            ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 rounded-full py-1 px-2.5">
              {item}
              <button onClick={() => onChange(items.filter((i) => i !== item))} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Picker for skills from the big SKILLS catalog, filtered by category
function SkillPicker({
  selected,
  onChange,
  categories,
  placeholder,
}: {
  selected: string[];
  onChange: (items: string[]) => void;
  categories: string[];
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const options = SKILLS.filter((s) => categories.includes(s.category));
  const filtered = options.filter(
    (s) =>
      (s.label.toLowerCase().includes(input.toLowerCase()) ||
        s.value.toLowerCase().includes(input.toLowerCase())) &&
      !selected.includes(s.label)
  );

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger className="w-full justify-start text-left rounded-xl" render={<Button variant="outline" />}>
          <Plus className="h-4 w-4 mr-2" />
          {placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0" align="start">
          <div className="p-3 border-b border-border">
            <Input
              placeholder="Search..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="max-h-[280px] overflow-y-auto p-2">
            {filtered.length === 0 && <p className="text-xs text-muted-foreground p-2">No more options</p>}
            {filtered.slice(0, 20).map((skill) => (
              <button
                key={skill.value}
                onClick={() => onChange([...selected, skill.label])}
                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-secondary transition-colors"
              >
                {skill.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 rounded-full py-1 px-2.5">
              {item}
              <button onClick={() => onChange(selected.filter((i) => i !== item))} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile page
// ---------------------------------------------------------------------------
function ProfilePageInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(EMPTY_PROFILE);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  async function fetchProfile() {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        const p = data.profile;
        if (p) {
          setFormData({
            name: data.user?.name || "",
            college: p.college || "",
            degree: p.degree || "",
            branch: p.branch || "",
            university: p.university || "",
            specialization: p.specialization || "",
            graduationYear: p.graduationYear?.toString() || "",
            cgpa: p.cgpa?.toString() || "",
            skills: p.skills || [],
            preferredRoles: p.preferredRoles || [],
            preferredLocations: p.preferredLocations || [],
            preferredCompanies: p.preferredCompanies || [],
            interests: p.interests || [],
            phone: p.phone || "",
            city: p.city || "",
            country: p.country || "",
            timeZone: p.timeZone || "",
            nationality: p.nationality || "",
            workAuthorization: p.workAuthorization || "",
            visaSponsorshipRequired: p.visaSponsorshipRequired ?? false,
            jobType: p.jobType || "",
            workMode: p.workMode || "",
            minSalary: p.minSalary?.toString() || "",
            targetSalary: p.targetSalary?.toString() || "",
            noticePeriod: p.noticePeriod || "",
            earliestJoining: p.earliestJoining || "",
            willingToRelocate: p.willingToRelocate ?? true,
            relevantCoursework: p.relevantCoursework || [],
            currentStatus: p.currentStatus || "",
            yearsOfExperience: p.yearsOfExperience?.toString() || "",
            currentCompany: p.currentCompany || "",
            previousCompanies: p.previousCompanies || [],
            hasInternships: p.hasInternships ?? false,
            hasFreelancing: p.hasFreelancing ?? false,
            hasResearch: p.hasResearch ?? false,
            hasTeaching: p.hasTeaching ?? false,
            hasOpenSource: p.hasOpenSource ?? false,
            experienceEntries: p.experienceEntries || [],
            programmingLanguages: p.programmingLanguages || [],
            frameworks: p.frameworks || [],
            libraries: p.libraries || [],
            databases: p.databases || [],
            cloudPlatforms: p.cloudPlatforms || [],
            devopsTools: p.devopsTools || [],
            aiMlTechnologies: p.aiMlTechnologies || [],
            dataAnalysisTools: p.dataAnalysisTools || [],
            designTools: p.designTools || [],
            softSkills: p.softSkills || [],
            skillProficiency: p.skillProficiency || {},
            resumeUrl: p.resumeUrl || "",
            portfolioUrl: p.portfolioUrl || "",
            githubUrl: p.githubUrl || "",
            linkedinUrl: p.linkedinUrl || "",
            leetcodeUrl: p.leetcodeUrl || "",
            codechefUrl: p.codechefUrl || "",
            hackerrankUrl: p.hackerrankUrl || "",
            kaggleUrl: p.kaggleUrl || "",
            personalWebsite: p.personalWebsite || "",
          });
          if (p.resumeUrl) setResumeName(p.resumeUrl.split("/").pop() || "Resume");
          // Profile exists → show read-only view (not an editable form)
          setHasSavedProfile(true);
          setIsEditing(false);
        } else {
          setHasSavedProfile(false);
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to save profile");
      toast.success("Profile saved successfully");
      setHasSavedProfile(true);
      setIsEditing(false);
      // Fire-and-forget: re-run agents with the fresh profile
      fetch("/api/opportunities/refresh", { method: "POST" }).catch(() => {});
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/profile/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      update("resumeUrl", data.url);
      setResumeName(file.name);
      toast.success("Resume uploaded");
    } catch {
      toast.error("Resume upload failed");
    }
  }

  function addExperienceEntry() {
    const entry: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      jobTitle: "",
      company: "",
      duration: "",
      responsibilities: "",
      technologies: [],
      achievements: "",
    };
    update("experienceEntries", [...(formData.experienceEntries || []), entry]);
  }

  function updateExperienceEntry(id: string, patch: Partial<ExperienceEntry>) {
    update(
      "experienceEntries",
      (formData.experienceEntries || []).map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }

  function removeExperienceEntry(id: string) {
    update("experienceEntries", (formData.experienceEntries || []).filter((e) => e.id !== id));
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const profileCompleteness = hasSavedProfile
    ? Math.min(100, Math.round(
        // Basic identity — 10%
        (session?.user?.name ? 3 : 0) +
        (session?.user?.email ? 2 : 0) +
        (formData.phone ? 2 : 0) +
        (formData.city ? 1.5 : 0) +
        (formData.country ? 1.5 : 0) +

        // Education — 15%
        (formData.college ? 5 : 0) +
        (formData.degree ? 4 : 0) +
        (formData.branch ? 2 : 0) +
        (formData.graduationYear !== "" ? 2 : 0) +
        (formData.cgpa !== "" ? 2 : 0) +

        // Skills — 25%
        (formData.programmingLanguages?.length ? 7 : 0) +
        (formData.frameworks?.length ? 5 : 0) +
        (formData.databases?.length ? 4 : 0) +
        (formData.cloudPlatforms?.length ? 3 : 0) +
        (formData.aiMlTechnologies?.length ? 3 : 0) +
        ((formData.skills?.length || 0) >= 3 ? 3 : (formData.skills?.length || 0)) +

        // Job Preferences — 15%
        (formData.preferredRoles?.length ? 6 : 0) +
        (formData.preferredLocations?.length ? 4 : 0) +
        (formData.jobType ? 3 : 0) +
        (formData.workMode ? 2 : 0) +

        // Experience — 15%
        (formData.currentStatus ? 5 : 0) +
        (formData.yearsOfExperience !== "" ? 4 : 0) +
        (formData.currentCompany ? 3 : 0) +
        (formData.previousCompanies?.length ? 3 : 0) +

        // Links & Portfolio — 10%
        (formData.githubUrl ? 3 : 0) +
        (formData.linkedinUrl ? 3 : 0) +
        (formData.resumeUrl ? 2 : 0) +
        (formData.portfolioUrl ? 2 : 0) +

        // Interests & Soft Skills — 5%
        (formData.interests?.length ? 2.5 : 0) +
        (formData.softSkills?.length ? 2.5 : 0) +

        // Salary & Relocation — 5%
        (formData.willingToRelocate !== undefined ? 2.5 : 0) +
        (formData.jobType && formData.workMode ? 2.5 : 0)
      ))
    : 0;

  // ============================== VIEW MODE ==============================
  if (!isEditing && hasSavedProfile) {
    const d = formData;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading tracking-tight">Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This is how AI agents see you — only {MATCH_THRESHOLD}%+ matches are shown on your board
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-xs text-muted-foreground">Profile completed</p>
              <p className={cn(
                "text-sm font-semibold",
                profileCompleteness >= 80 ? "text-green-400" : profileCompleteness >= 50 ? "text-amber-400" : "text-red-400"
              )}>{profileCompleteness}%</p>
            </div>
            <Button onClick={() => setIsEditing(true)} className="rounded-xl">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {profileCompleteness < 100 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {profileCompleteness < 50
                  ? "Your profile needs attention"
                  : profileCompleteness < 80
                  ? "Almost halfway there"
                  : "Nearly complete!"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete your profile to 100% for the best AI-powered job matches and personalized recommendations.
                {profileCompleteness < 80 && " Fill in missing sections below to boost your match quality."}
              </p>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <SectionCard icon={User} title="Basic Information">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <ViewField label="Full Name" value={d.name || session?.user?.name} />
            <ViewField label="Email Address" value={session?.user?.email} />
            <ViewField label="Phone Number" value={d.phone} />
            <ViewField label="Current City" value={d.city} />
            <ViewField label="Country" value={d.country} />
            <ViewField label="Time Zone" value={d.timeZone} />
            <ViewField label="Nationality" value={d.nationality} />
            <ViewField label="Work Authorization" value={d.workAuthorization} />
            <ViewBool label="Visa Sponsorship Required" value={d.visaSponsorshipRequired} />
          </div>
        </SectionCard>

        {/* Job Preferences */}
        <SectionCard icon={Briefcase} title="Job Preferences">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <ViewChips label="Desired Job Roles" items={d.preferredRoles} full />
            <ViewField label="Job Type" value={d.jobType} />
            <ViewField label="Work Mode" value={d.workMode} />
            <ViewChips label="Preferred Locations" items={d.preferredLocations} />
            <ViewField label="Minimum Salary (INR)" value={d.minSalary ? `₹${Number(d.minSalary).toLocaleString("en-IN")}` : ""} />
            <ViewField label="Target Salary (INR)" value={d.targetSalary ? `₹${Number(d.targetSalary).toLocaleString("en-IN")}` : ""} />
            <ViewField label="Notice Period" value={d.noticePeriod} />
            <ViewField label="Earliest Joining Date" value={d.earliestJoining} />
            <ViewBool label="Willing to Relocate" value={d.willingToRelocate} />
            <ViewChips label="Preferred Companies" items={d.preferredCompanies} />
          </div>
        </SectionCard>

        {/* Education */}
        <SectionCard icon={GraduationCap} title="Education">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <ViewField label="University / College" value={d.university || d.college} />
            <ViewField label="Degree" value={d.degree} />
            <ViewField label="Specialization / Branch" value={d.specialization || d.branch} />
            <ViewField label="Graduation Year" value={d.graduationYear} />
            <ViewField label="CGPA" value={d.cgpa} />
            <ViewChips label="Relevant Coursework" items={d.relevantCoursework} full />
          </div>
        </SectionCard>

        {/* Experience */}
        <SectionCard icon={FolderKanban} title="Experience">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <ViewField label="Current Status" value={d.currentStatus} />
            <ViewField label="Years of Experience" value={d.yearsOfExperience} />
            <ViewField label="Current Company" value={d.currentCompany} />
            <ViewChips label="Previous Companies" items={d.previousCompanies} />
            <ViewBool label="Internships" value={d.hasInternships} />
            <ViewBool label="Freelancing" value={d.hasFreelancing} />
            <ViewBool label="Research Experience" value={d.hasResearch} />
            <ViewBool label="Teaching Experience" value={d.hasTeaching} />
            <ViewBool label="Open Source Contributions" value={d.hasOpenSource} />
          </div>
          {d.experienceEntries && d.experienceEntries.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Work History</p>
              {d.experienceEntries.map((entry) => (
                <Card key={entry.id} className="bg-secondary/30">
                  <CardContent className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {entry.jobTitle || "Role"}
                        {entry.company && <span className="text-muted-foreground"> — {entry.company}</span>}
                      </p>
                      {entry.duration && <Badge variant="outline" className="text-xs">{entry.duration}</Badge>}
                    </div>
                    {entry.responsibilities && <p className="text-xs text-muted-foreground">{entry.responsibilities}</p>}
                    {entry.technologies.length > 0 && <ViewChips label="Technologies" items={entry.technologies} />}
                    {entry.achievements && <p className="text-xs text-muted-foreground">🏆 {entry.achievements}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Technical Skills */}
        <SectionCard icon={Code2} title="Technical Skills">
          <div className="space-y-4">
            <ViewChips label="Programming Languages" items={d.programmingLanguages} full />
            <ViewChips label="Frameworks" items={d.frameworks} full />
            <ViewChips label="Libraries" items={d.libraries} full />
            <ViewChips label="Databases" items={d.databases} full />
            <ViewChips label="Cloud Platforms" items={d.cloudPlatforms} full />
            <ViewChips label="DevOps Tools" items={d.devopsTools} full />
            <ViewChips label="AI/ML Technologies" items={d.aiMlTechnologies} full />
            <ViewChips label="Data Analysis Tools" items={d.dataAnalysisTools} full />
            <ViewChips label="Design Tools" items={d.designTools} full />
            <ViewChips label="Soft Skills" items={d.softSkills} full />
            {d.skillProficiency && Object.keys(d.skillProficiency).length > 0 && (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(d.skillProficiency).map(([skill, level]) => (
                  <div key={skill} className="flex items-center justify-between text-sm">
                    <span>{skill}</span>
                    <Badge variant="secondary" className="text-xs">{level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Resume & Portfolio */}
        <SectionCard icon={FileText} title="Resume & Portfolio">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {d.resumeUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Resume</p>
                <a
                  href={d.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {resumeName || "Download resume"}
                </a>
              </div>
            )}
            <ViewUrl label="Portfolio Website" value={d.portfolioUrl} />
            <ViewUrl label="GitHub" value={d.githubUrl} />
            <ViewUrl label="LinkedIn" value={d.linkedinUrl} />
            <ViewUrl label="LeetCode" value={d.leetcodeUrl} />
            <ViewUrl label="CodeChef" value={d.codechefUrl} />
            <ViewUrl label="HackerRank" value={d.hackerrankUrl} />
            <ViewUrl label="Kaggle" value={d.kaggleUrl} />
            <ViewUrl label="Personal Website" value={d.personalWebsite} />
          </div>
        </SectionCard>

        <div className="flex justify-end pb-8">
          <Button onClick={() => setIsEditing(true)} size="lg" className="rounded-xl">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
    );
  }

  // ============================== EDIT MODE ==============================
  const d = formData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">
            {hasSavedProfile ? "Edit Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {hasSavedProfile
              ? "Update your details — agents will re-match opportunities against them."
              : "Set up your profile to get personalized recommendations."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasSavedProfile && (
            <Button variant="ghost" className="rounded-xl" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 75% match notice */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
        <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-foreground">
            Only opportunities with {MATCH_THRESHOLD}%+ profile match are shown to you
          </p>
          <p className="text-muted-foreground mt-0.5">
            Our AI agents score every job against your profile (skills, roles, education, experience).
            Anything below {MATCH_THRESHOLD}% is considered not eligible and will never appear on your dashboard.
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <SectionCard icon={User} title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={d.name || ""} onChange={(e) => update("name", e.target.value)} className="rounded-xl" placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={session?.user?.email || ""} disabled className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={d.phone || ""} onChange={(e) => update("phone", e.target.value)} className="rounded-xl" placeholder="+91 98XXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label>Current City</Label>
            <Input value={d.city || ""} onChange={(e) => update("city", e.target.value)} className="rounded-xl" placeholder="e.g., Bhopal" />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={d.country || ""} onChange={(e) => update("country", e.target.value)} className="rounded-xl" placeholder="e.g., India" />
          </div>
          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Select value={d.timeZone || ""} onValueChange={(v) => v && update("timeZone", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select time zone" /></SelectTrigger>
              <SelectContent>
                {TIME_ZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nationality</Label>
            <Input value={d.nationality || ""} onChange={(e) => update("nationality", e.target.value)} className="rounded-xl" placeholder="e.g., Indian" />
          </div>
          <div className="space-y-2">
            <Label>Work Authorization</Label>
            <Select value={d.workAuthorization || ""} onValueChange={(v) => v && update("workAuthorization", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                {WORK_AUTHORIZATIONS.map((wa) => (
                  <SelectItem key={wa} value={wa}>{wa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="visa"
              checked={!!d.visaSponsorshipRequired}
              onChange={(e) => update("visaSponsorshipRequired", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="visa" className="cursor-pointer">I require visa sponsorship</Label>
          </div>
        </div>
      </SectionCard>

      {/* Job Preferences */}
      <SectionCard icon={Briefcase} title="Job Preferences">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Desired Job Roles</Label>
            <ChipEditor
              items={d.preferredRoles || []}
              onChange={(items) => update("preferredRoles", items)}
              placeholder="Type a role and press Enter, or pick from suggestions"
              suggestions={JOB_ROLES.map((r) => r.label)}
            />
          </div>
          <Separator />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={d.jobType || ""} onValueChange={(v) => v && update("jobType", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select job type" /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Mode</Label>
              <Select value={d.workMode || ""} onValueChange={(v) => v && update("workMode", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select work mode" /></SelectTrigger>
                <SelectContent>
                  {WORK_MODES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum Salary (INR/year)</Label>
              <Input type="number" value={d.minSalary || ""} onChange={(e) => update("minSalary", e.target.value)} className="rounded-xl" placeholder="e.g., 600000" />
            </div>
            <div className="space-y-2">
              <Label>Target Salary (INR/year)</Label>
              <Input type="number" value={d.targetSalary || ""} onChange={(e) => update("targetSalary", e.target.value)} className="rounded-xl" placeholder="e.g., 1200000" />
            </div>
            <div className="space-y-2">
              <Label>Notice Period</Label>
              <Select value={d.noticePeriod || ""} onValueChange={(v) => v && update("noticePeriod", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select notice period" /></SelectTrigger>
                <SelectContent>
                  {NOTICE_PERIODS.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Earliest Joining Date</Label>
              <Input type="date" value={d.earliestJoining || ""} onChange={(e) => update("earliestJoining", e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="relocate"
              checked={!!d.willingToRelocate}
              onChange={(e) => update("willingToRelocate", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="relocate" className="cursor-pointer">Willing to relocate</Label>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label>Preferred Locations</Label>
            <ChipEditor
              items={d.preferredLocations || []}
              onChange={(items) => update("preferredLocations", items)}
              placeholder="e.g., Remote, Bangalore"
              suggestions={LOCATIONS.map((l) => l.label)}
            />
          </div>
          <div className="space-y-3">
            <Label>Preferred Companies</Label>
            <ChipEditor
              items={d.preferredCompanies || []}
              onChange={(items) => update("preferredCompanies", items)}
              placeholder="e.g., Google, Microsoft"
            />
          </div>
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard icon={GraduationCap} title="Education">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>University / College</Label>
            <Select
              value={d.university || d.college || ""}
              onValueChange={(v) => {
                if (!v) return;
                update("university", v);
                update("college", v);
              }}
            >
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select your university" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectGroup>
                  <SelectLabel>IITs</SelectLabel>
                  {COLLEGES.filter((c) => c.type === "IIT").map((c) => (
                    <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>NITs & IIITs</SelectLabel>
                  {COLLEGES.filter((c) => c.type === "NIT" || c.type === "IIIT").map((c) => (
                    <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Other Institutes</SelectLabel>
                  {COLLEGES.filter((c) => !["IIT", "NIT", "IIIT"].includes(c.type)).slice(0, 25).map((c) => (
                    <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Degree</Label>
            <Select value={d.degree || ""} onValueChange={(v) => v && update("degree", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select degree" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {DEGREES.map((deg) => (
                  <SelectItem key={deg.value} value={deg.label}>{deg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Specialization / Branch</Label>
            <Select value={d.specialization || d.branch || ""} onValueChange={(v) => {
              if (!v) return;
              update("specialization", v);
              update("branch", v);
            }}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {BRANCHES.map((b) => (
                  <SelectItem key={b.value} value={b.label}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Graduation Year</Label>
            <Select value={d.graduationYear?.toString() || ""} onValueChange={(v) => v && update("graduationYear", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {GRADUATION_YEARS.map((y) => (
                  <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>CGPA (Optional)</Label>
            <Input type="number" step="0.01" min="0" max="10" value={d.cgpa || ""} onChange={(e) => update("cgpa", e.target.value)} className="rounded-xl" placeholder="e.g., 8.5" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Relevant Coursework</Label>
            <ChipEditor
              items={d.relevantCoursework || []}
              onChange={(items) => update("relevantCoursework", items)}
              placeholder="e.g., Data Structures, Operating Systems, ML"
            />
          </div>
        </div>
      </SectionCard>

      {/* Experience */}
      <SectionCard icon={FolderKanban} title="Experience">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Select value={d.currentStatus || ""} onValueChange={(v) => v && update("currentStatus", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {CURRENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input type="number" step="0.5" min="0" value={d.yearsOfExperience || ""} onChange={(e) => update("yearsOfExperience", e.target.value)} className="rounded-xl" placeholder="e.g., 1.5" />
            </div>
            <div className="space-y-2">
              <Label>Current Company</Label>
              <Input value={d.currentCompany || ""} onChange={(e) => update("currentCompany", e.target.value)} className="rounded-xl" placeholder="e.g., Google" />
            </div>
            <div className="space-y-2">
              <Label>Previous Companies</Label>
              <ChipEditor items={d.previousCompanies || []} onChange={(items) => update("previousCompanies", items)} placeholder="Add company" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ["hasInternships", "Internships"],
              ["hasFreelancing", "Freelancing"],
              ["hasResearch", "Research"],
              ["hasTeaching", "Teaching"],
              ["hasOpenSource", "Open Source"],
            ] as [keyof ProfileData, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => update(key, !(d[key] as boolean))}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 text-xs font-medium transition-all",
                  d[key]
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 border-border hover:border-primary/30 text-muted-foreground"
                )}
              >
                {d[key] && <Check className="h-3.5 w-3.5" />}
                {label}
              </button>
            ))}
          </div>

          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Work History / Experience Entries</Label>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={addExperienceEntry}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Entry
            </Button>
          </div>

          {(d.experienceEntries || []).map((entry, idx) => (
            <Card key={entry.id} className="bg-secondary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Entry {idx + 1}</p>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeExperienceEntry(entry.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Job Title</Label>
                    <Input value={entry.jobTitle} onChange={(e) => updateExperienceEntry(entry.id, { jobTitle: e.target.value })} className="rounded-xl" placeholder="e.g., SDE Intern" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Company</Label>
                    <Input value={entry.company} onChange={(e) => updateExperienceEntry(entry.id, { company: e.target.value })} className="rounded-xl" placeholder="Company name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Duration</Label>
                    <Input value={entry.duration} onChange={(e) => updateExperienceEntry(entry.id, { duration: e.target.value })} className="rounded-xl" placeholder="e.g., Jan 2025 - Jun 2025" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Technologies Used</Label>
                    <ChipEditor
                      items={entry.technologies}
                      onChange={(items) => updateExperienceEntry(entry.id, { technologies: items })}
                      placeholder="Add technology"
                      suggestions={SKILLS.map((s) => s.label)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs">Responsibilities</Label>
                    <Textarea value={entry.responsibilities} onChange={(e) => updateExperienceEntry(entry.id, { responsibilities: e.target.value })} className="rounded-xl" rows={2} placeholder="What did you do?" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs">Achievements</Label>
                    <Textarea value={entry.achievements} onChange={(e) => updateExperienceEntry(entry.id, { achievements: e.target.value })} className="rounded-xl" rows={2} placeholder="e.g., Reduced API latency by 40%" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      {/* Technical Skills */}
      <SectionCard icon={Code2} title="Technical Skills">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Programming Languages</Label>
            <SkillPicker selected={d.programmingLanguages || []} onChange={(items) => update("programmingLanguages", items)} categories={["Programming"]} placeholder="Add programming languages" />
          </div>
          <div className="space-y-2">
            <Label>Frameworks</Label>
            <SkillPicker selected={d.frameworks || []} onChange={(items) => update("frameworks", items)} categories={["Frontend", "Backend", "Mobile"]} placeholder="Add frameworks" />
          </div>
          <div className="space-y-2">
            <Label>Libraries</Label>
            <SkillPicker selected={d.libraries || []} onChange={(items) => update("libraries", items)} categories={["AI/ML", "Data Science", "Tools", "Security"]} placeholder="Add libraries" />
          </div>
          <div className="space-y-2">
            <Label>Databases</Label>
            <SkillPicker selected={d.databases || []} onChange={(items) => update("databases", items)} categories={["Database"]} placeholder="Add databases" />
          </div>
          <div className="space-y-2">
            <Label>Cloud Platforms</Label>
            <SkillPicker selected={d.cloudPlatforms || []} onChange={(items) => update("cloudPlatforms", items)} categories={["Cloud"]} placeholder="Add cloud platforms" />
          </div>
          <div className="space-y-2">
            <Label>DevOps Tools</Label>
            <SkillPicker selected={d.devopsTools || []} onChange={(items) => update("devopsTools", items)} categories={["DevOps"]} placeholder="Add DevOps tools" />
          </div>
          <div className="space-y-2">
            <Label>AI / ML Technologies</Label>
            <SkillPicker selected={d.aiMlTechnologies || []} onChange={(items) => update("aiMlTechnologies", items)} categories={["AI Agent", "AI/ML"]} placeholder="Add AI/ML technologies" />
          </div>
          <div className="space-y-2">
            <Label>Data Analysis Tools</Label>
            <SkillPicker selected={d.dataAnalysisTools || []} onChange={(items) => update("dataAnalysisTools", items)} categories={["Data Science"]} placeholder="Add data analysis tools" />
          </div>
          <div className="space-y-2">
            <Label>Design Tools</Label>
            <SkillPicker selected={d.designTools || []} onChange={(items) => update("designTools", items)} categories={["Design"]} placeholder="Add design tools" />
          </div>
          <div className="space-y-2">
            <Label>Soft Skills</Label>
            <ChipEditor
              items={d.softSkills || []}
              onChange={(items) => update("softSkills", items)}
              placeholder="e.g., Communication, Leadership"
            />
          </div>
        </div>
      </SectionCard>

      {/* Resume & Portfolio */}
      <SectionCard icon={FileText} title="Resume & Portfolio">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Resume</Label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeUpload}
              />
              <Button variant="outline" className="rounded-xl" onClick={() => fileInputRef.current?.click()}>
                <FileText className="h-4 w-4 mr-2" />
                {resumeName ? "Replace Resume" : "Upload Resume"}
              </Button>
              {resumeName && <span className="text-xs text-muted-foreground">{resumeName}</span>}
            </div>
            <p className="text-[11px] text-muted-foreground">PDF, DOC or DOCX. Stored privately for recruiters/agents.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Portfolio Website</Label>
              <Input value={d.portfolioUrl || ""} onChange={(e) => update("portfolioUrl", e.target.value)} className="rounded-xl" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input value={d.githubUrl || ""} onChange={(e) => update("githubUrl", e.target.value)} className="rounded-xl" placeholder="https://github.com/username" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={d.linkedinUrl || ""} onChange={(e) => update("linkedinUrl", e.target.value)} className="rounded-xl" placeholder="https://linkedin.com/in/username" />
            </div>
            <div className="space-y-2">
              <Label>LeetCode</Label>
              <Input value={d.leetcodeUrl || ""} onChange={(e) => update("leetcodeUrl", e.target.value)} className="rounded-xl" placeholder="https://leetcode.com/username" />
            </div>
            <div className="space-y-2">
              <Label>CodeChef</Label>
              <Input value={d.codechefUrl || ""} onChange={(e) => update("codechefUrl", e.target.value)} className="rounded-xl" placeholder="https://codechef.com/users/username" />
            </div>
            <div className="space-y-2">
              <Label>HackerRank</Label>
              <Input value={d.hackerrankUrl || ""} onChange={(e) => update("hackerrankUrl", e.target.value)} className="rounded-xl" placeholder="https://hackerrank.com/username" />
            </div>
            <div className="space-y-2">
              <Label>Kaggle</Label>
              <Input value={d.kaggleUrl || ""} onChange={(e) => update("kaggleUrl", e.target.value)} className="rounded-xl" placeholder="https://kaggle.com/username" />
            </div>
            <div className="space-y-2">
              <Label>Personal Website</Label>
              <Input value={d.personalWebsite || ""} onChange={(e) => update("personalWebsite", e.target.value)} className="rounded-xl" placeholder="https://..." />
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="rounded-xl">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <SessionProvider>
      <DashboardLayout>
        <ProfilePageInner />
      </DashboardLayout>
    </SessionProvider>
  );
}
