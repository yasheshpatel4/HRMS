interface DocumentUploadProps {
  travelId: number;
  onUploadSuccess: () => void;
}

const DocumentUpload = ({ travelId, onUploadSuccess }: DocumentUploadProps) => {
  const handleUpload = async () => {
    console.log("Uploading for Travel ID:", travelId);
    onUploadSuccess();
  };

  return (
    <div className="p-4 border rounded">
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2">
        Upload Document
      </button>
    </div>
  );
};

export default DocumentUpload;
