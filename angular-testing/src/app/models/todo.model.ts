export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

