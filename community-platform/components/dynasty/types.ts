
export interface PersonRecord {
  id: string; // Internal UUID for graph manipulation
  genealogyId: string; // Semantic ID: Village_Page_Gen_Serial
  name: string;
  nameEnglish?: string;
  villageEnglish?: string;
  fatherName: string | null;
  parentIds?: string[];
  spouseIds?: string[];
  gender?: string;
  aliases?: string;
  fatherId?: string | null; // UUID of the father node for precise linking
  generation: number | null;

  // Location Data
  villageName: string; // Primary/Current Village context
  villages: string[]; // List of all associated villages (Migration/Residence)

  pageNumber: number | string; // Changed to support string (e.g. 'vi')
  sons: string[];
  siblings: string[];
  attributes: string | null; // Raw text in brackets
  migrationInfo: string | null; // Structured migration info
  noteType?: 'MIGRATION' | 'CROSS_REF' | 'OTHER'; // Visual styling category
  boundingBox?: [number, number, number, number];

  // Visual State
  x?: number;
  y?: number;
  isExpanded?: boolean;
  isVisible?: boolean;
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ProjectState {
  id: string;
  fileName: string;
  file: File;
  status: ProcessStatus;
  progress: number;
  processingPage: number;
  totalPages: number;
  records: PersonRecord[];
  images: Record<number, string>;
  error?: string;
}

export interface ProcessingStats {
  totalFiles: number;
  completedFiles: number;
  totalPersons: number;
  processingTime: string;
}

export interface QueueItem {
  id: string;
  baseName: string; // Common identifier (e.g. "VillageName")
  pdf?: File;
  csv?: File;
  status: 'WAITING' | 'PROCESSING' | 'DONE';
}
