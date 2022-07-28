/// <reference types="vite/client" />

type ID = string;

export interface Resource8base {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface Team extends Resource8base {
  name: string;
}

export interface User extends Resource8base {
  email: string;
  roles: { items: Role[] };
  team: {
    items: Team[];
  };
}
export interface Role {
  name: string;
}

export interface Board extends Resource8base {
  title: string;

  // Board order JSON encoded in DB and thus can be a string
  // when decoded it's an array of Columns
  order: string | Column[];

  // relationships
  image?: Partial<File>;
  tasks?: Partial<Task>[];
}

export interface Column {
  id: ID;
  title: string;
  taskIds: ID[];
}

export interface Task extends Resource8base {
  title: string;
  description: string;
  labels: Label[];
  dueAt: Date;

  // relationships
  board?: Partial<Board>;
  comments?: Partial<Comment>[];
}

export interface Comment extends Resource8base {
  message: string;

  // relationships
  task?: Partial<Task>;
}

export type LabelColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink";

export interface Label extends Resource8base {
  label: string;
  color: LabelColor;

  // relationships
  board?: Partial<Board>;
  tasks?: Partial<Task>[];
}

export interface File extends Resource8base {
  downloadStorageUrl: string;
  downloadUrl: string;
  filename: string;
  meta: {
    path: string;
    size: number;
    mimetype: string;
    workspaceId: string;
  };
  previewUrl: string;
  provider: string;
  public: boolean;
  shareUrl: string;
  uploadUrl: string;
  uploaded: boolean;
}

interface ImportMetaEnv {
  readonly VITE_TWICPICS_URL: string;
  readonly VITE_READ_API_TOKEN: string;
  readonly VITE_KENDO_UI_LICENSE: string;
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_AUTH_PROFILE_ID: string;
  readonly HTTP_8BASE_API_LINK: string;
  readonly VITE_AUTH_DOMAIN: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
