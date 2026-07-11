import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import clsx from "clsx";

export const FileUpload = ({
    onFilesChange,
    acceptedTypes = '.pdf',
    maxFiles = 10,
    maxSizeMB = 10
}) => {
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        if (!file.type.includes('pdf') && acceptedTypes.includes('.pdf')) {
            return 'Only PDF files are allowed';
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File size must be less than ${maxSizeMB}MB`;
        }
        return null;
    };

    const handleFiles = (newFiles) => {
        if (!newFiles) return;

        const fileArray = Array.from(newFiles);
        const validFiles = [];
        let errorMessage = '';

        for (const file of fileArray) {
            const validation = validateFile(file);
            if (validation) {
                errorMessage = validation;
                break;
            }
            validFiles.push(file);
        }

        if (errorMessage) {
            setError(errorMessage);
            return;
        }

        if (files.length + validFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setError('');
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const removeFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <Card
                className={clsx(
                    'border-2 border-dashed transition-colors cursor-pointer',
                    dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                    'hover:border-primary hover:bg-primary/5'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Drop PDF files here</p>
                        <p className="text-sm text-muted-foreground">
                            or <span className="text-primary">click to browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Maximum {maxFiles} files, up to {maxSizeMB}MB each
                        </p>
                    </div>
                </div>
            </Card>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-card border rounded-md"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};