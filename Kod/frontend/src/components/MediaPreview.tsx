import ModelViewer from "../pages/ModelViewer";

import type { FileItem } from "../types";

interface Props {
  file: FileItem | null;
  className?: string;
}

const MediaPreview = ({ file, className }: Props) => {
  if (!file) return <div>No preview</div>;

  const url = `http://localhost:3001/${file.file_path.replace(/\\/g, "/")}`;

  if (file.file_type?.startsWith("image/")) {
    return <img src={url} alt={file.file_name} className={className} />;
  }

  if (file.file_type?.startsWith("video/")) {
    return (
      <video src={url} muted loop autoPlay playsInline className={className} />
    );
  }

  return (
    <div className={className || "model-wrapper"}>
      <ModelViewer filePath={url} />
    </div>
  );
};

export default MediaPreview;
