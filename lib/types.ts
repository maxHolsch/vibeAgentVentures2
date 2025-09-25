export type Chunk = {
  id: string;
  title: string;
  path: string;
  text: string;
};

export type EmbeddingIndex = {
  createdAt: string;
  chunks: Chunk[];
};
