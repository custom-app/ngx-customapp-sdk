export type ContextError<ReportExtensions> = {
  time: number;
  url: string;
  error: string;
} & ReportExtensions
