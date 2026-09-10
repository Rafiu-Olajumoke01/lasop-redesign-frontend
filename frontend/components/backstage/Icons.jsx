import {
  User,
  FileText,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  CheckCircle2,
  UserPlus,
  Briefcase,
  Tag,
  LayoutDashboard,
  IdCard,
  Wallet,
  ClipboardList,
  FolderKanban,
  AlertTriangle,
  MessageCircle,
  MapPin,
} from 'lucide-react';

// ─── Standalone icons used across Overview/Students/etc. ───────────────────
// Same export names as before, so nothing else needs to change.

export function PersonIcon(props) {
  return <User size={20} strokeWidth={2} {...props} />;
}

export function BlogIcon(props) {
  return <FileText size={20} strokeWidth={2} {...props} />;
}

export function GroupIcon(props) {
  return <Users size={20} strokeWidth={2} {...props} />;
}

export function GradCapIcon(props) {
  return <GraduationCap size={20} strokeWidth={2} {...props} />;
}

export function BuildingIcon(props) {
  return <Building2 size={20} strokeWidth={2} {...props} />;
}

export function CoursesIcon(props) {
  return <BookOpen size={20} strokeWidth={2} {...props} />;
}

export function CohortIcon(props) {
  return <Layers size={20} strokeWidth={2} {...props} />;
}

export function CheckBadgeIcon(props) {
  return <CheckCircle2 size={20} strokeWidth={2} {...props} />;
}

export function NewApplicantIcon(props) {
  return <UserPlus size={20} strokeWidth={2} {...props} />;
}

export function TutorIcon(props) {
  return <Briefcase size={20} strokeWidth={2} {...props} />;
}

export function TagIcon(props) {
  return <Tag size={16} strokeWidth={2} {...props} />;
}

// ─── Sidebar Nav_________________________________________

export function NavIcon({ icon: Icon, className = '' }) {
  return <Icon size={18} strokeWidth={2} className={`shrink-0 ${className}`} />;
}

export const NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'cohorts', label: 'Cohorts', icon: Layers },
  { key: 'applicants', label: 'Applicants', icon: UserPlus },
  { key: 'tutors', label: 'Tutors', icon: Briefcase },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'staffs', label: 'Staffs', icon: IdCard },
  { key: 'finances', label: 'Finances', icon: Wallet },
  { key: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { key: 'exam', label: 'Exam', icon: FileText },
  { key: 'results', label: 'Results', icon: ClipboardList },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'queries', label: 'Queries', icon: AlertTriangle },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'postjob', label: 'Post Job', icon: Building2 },
  { key: 'centers', label: 'Centers', icon: MapPin },
];