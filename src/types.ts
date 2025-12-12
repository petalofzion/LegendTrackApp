export type Topic = {
  id: string;
  epoch: number | null;
  epochTheme: string;
  track: string;
  trackTitle: string;
  topicName: string;
  description: string;
  depthTarget: string;
  currentDepth: string;
  status: string;
  lastWorkedOn: string;
  exampleProject: string;
  conceptEvidence: string;
  implementationEvidence: string;
  applicationEvidence: string;
  relatedTopicIds: string;
  notes: string;
  resources: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  topicIds: string;
  status: string;
  startDate: string;
  endDate: string;
  outcomes: string;
  resources: string;
};
