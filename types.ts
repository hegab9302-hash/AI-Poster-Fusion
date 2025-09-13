
export enum WorkflowStep {
  Upload = 'Upload',
  Ratio = 'Ratio',
  Concept = 'Concept',
  Edit = 'Edit',
  Download = 'Download',
}

export type AspectRatio = {
  name: string;
  value: string;
  icon: JSX.Element;
};

export type GeneratedPoster = {
  id: string;
  src: string;
};
