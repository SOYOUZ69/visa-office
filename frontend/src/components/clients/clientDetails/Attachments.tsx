import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../ui/card";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { Attachment, User } from "@/types";
import { Button } from "../../ui/button";

const Attachments = ({
  attachments,
  handleFileUpload,
  handleDownloadAttachment,
  handleDeleteAttachment,
  user,
  uploading,
}: {
  attachments: Attachment[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadAttachment: (attachment: Attachment) => void;
  handleDeleteAttachment: (attachmentId: string) => void;
  user: User;
  uploading: boolean;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Documents</span>
        </CardTitle>
        <CardDescription>Upload and manage client documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.role === "ADMIN" && (
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="flex-1"
              disabled={uploading}
            />
            <Upload className="h-4 w-4 text-gray-400" />
          </div>
        )}

        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{attachment.originalName}</div>
                    <div className="text-sm text-gray-500">
                      {attachment.type} •{" "}
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {user?.role === "ADMIN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No documents uploaded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Attachments;
