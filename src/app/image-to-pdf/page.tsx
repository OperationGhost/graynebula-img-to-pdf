"use client";

import { useState, useEffect } from "react";
import { compressImage, generatePDF } from "@/components/ImgToPdf/ImgToPdf";
import {
    FiUpload,
    FiDownload,
    FiX,
    FiImage,
    FiGrid,
    FiList,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";

import {
    DndContext,
    closestCenter,
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import HomeNavbar from "@/components/HomeNavbar/HomeNavbar";

// Sortable item component
function SortableItem({ id, src, onRemove, index, onPreview }: any) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : "transform 150ms ease-out",
        height: "fit-content",
    };

    useEffect(() => {
        // No animation library used for sorting items.
    }, [isDragging]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        relative cursor-default
        bg-gradient-to-br from-slate-800/50 to-slate-900/50
        backdrop-blur-sm border border-slate-700/50
        rounded-xl overflow-hidden shadow-lg hover:shadow-xl
        ${isDragging ? 'opacity-50 scale-105 shadow-2xl' : ''}
      `}
        >
            <div className="flex items-center justify-between gap-2 p-3 bg-slate-950/80 border-b border-slate-700/50">
                <button
                    {...attributes}
                    {...listeners}
                    type="button"
                    className="
            w-7 h-7
            bg-slate-700/80 hover:bg-slate-600
            rounded-full flex items-center justify-center
            text-white shadow-lg hover:shadow-xl
            transition-all duration-200 hover:scale-110
            opacity-90 hover:opacity-100
            cursor-grab active:cursor-grabbing
          "
                    aria-label="Drag to reorder"
                >
                    <FiList size={16} />
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="
            w-7 h-7
            bg-red-500/90 hover:bg-red-600
            rounded-full flex items-center justify-center
            text-white shadow-lg hover:shadow-xl
            transition-all duration-200 hover:scale-110
            opacity-100
          "
                    aria-label="Remove image"
                >
                    <FiX size={16} />
                </button>
            </div>

            <div
                className="relative overflow-hidden rounded-b-xl bg-slate-800/30 h-48 w-full group cursor-pointer"
                onClick={() => onPreview(index)}
            >
                <img
                    src={src}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
                        <FiGrid size={12} />
                        <span>{index + 1}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ImageToPdfPage() {
    const [images, setImages] = useState<string[]>([]);
    const [orientation, setOrientation] = useState<"p" | "l">("p");
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, currentIndex: 0 });

    const openPreview = (index: number) => {
        setPreviewModal({ isOpen: true, currentIndex: index });
    };

    const closePreview = () => {
        setPreviewModal({ isOpen: false, currentIndex: 0 });
    };

    const nextImage = () => {
        setPreviewModal(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % images.length
        }));
    };

    const prevImage = () => {
        setPreviewModal(prev => ({
            ...prev,
            currentIndex: prev.currentIndex === 0 ? images.length - 1 : prev.currentIndex - 1
        }));
    };

    // Keyboard navigation for preview modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!previewModal.isOpen) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    prevImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextImage();
                    break;
                case 'Escape':
                    e.preventDefault();
                    closePreview();
                    break;
            }
        };

        if (previewModal.isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [previewModal.isOpen, previewModal.currentIndex]);

    const handleUpload = async (e: any) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Clear the input value to allow re-uploading the same files
        e.target.value = '';

        setLoading(true);
        try {
            // Process files in batches to avoid overwhelming the browser
            const batchSize = 10;
            const compressed: string[] = [];

            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                const batchCompressed = await Promise.all(
                    batch.map((file: any) => compressImage(file, 0.7))
                );
                compressed.push(...batchCompressed);

                // Update progress for large uploads
                if (files.length > batchSize) {
                    setImages((prev) => [...prev, ...batchCompressed]);
                }
            }

            if (files.length <= batchSize) {
                setImages((prev) => [...prev, ...compressed]);
            }
        } catch (error) {
            console.error("Error compressing images:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = parseInt(active.id.split('-')[1]);
        const newIndex = parseInt(over.id.split('-')[1]);

        setImages(arrayMove(images, oldIndex, newIndex));
    };

    const handleDownload = async () => {
        if (images.length === 0) return;

        setLoading(true);
        try {
            await generatePDF(images, orientation);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length === 0) return;

        setLoading(true);
        try {
            const compressed = await Promise.all(
                files.map((file: any) => compressImage(file, 0.7))
            );
            setImages((prev) => [...prev, ...compressed]);
        } catch (error) {
            console.error("Error compressing images:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <HomeNavbar />
        <div className="min-h-screen  from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-slate-700/50 rounded-full px-6 py-3 mb-6">
                        <FiImage className="text-blue-400" size={24} />
                        <span className="text-slate-300 font-medium">Image to PDF Converter</span>
                    </div>

                    <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
                        Transform Images into PDFs
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Upload your images, arrange them in any order, and generate a professional PDF document in seconds.
                    </p>
                </div>

                {/* Upload Area */}
                <div
                    className={`
            relative mb-8 border-2 rounded-2xl transition-all duration-300
            ${dragOver
                            ? 'border-blue-400 bg-blue-500/10 scale-105'
                            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
                        }
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {images.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-[1.8fr_0.95fr] p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={images.map((_, index) => `image-${index}`)} strategy={verticalListSortingStrategy}>
                                        {images.map((img, index) => (
                                            <SortableItem
                                                key={`image-${index}`}
                                                id={`image-${index}`}
                                                src={img}
                                                index={index}
                                                onRemove={() => setImages(images.filter((_, i) => i !== index))}
                                                onPreview={openPreview}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>

                            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/85 p-6 flex flex-col justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-3 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-100 mb-5">
                                        <FiUpload size={18} />
                                        <span className="font-medium">Add more images</span>
                                    </div>
                                    <p className="text-slate-400 mb-6">
                                        Upload additional images to extend your PDF. Reorder pages by dragging thumbnails.
                                    </p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                    >
                                        <FiUpload size={18} />
                                        Add more images
                                    </label>
                                </div>

                                <div className="rounded-3xl border border-slate-700/20 bg-slate-900/70 p-4 text-slate-300">
                                    <p className="text-sm font-semibold text-slate-100 mb-2">Tip</p>
                                    <p className="text-sm leading-6">
                                        Click the red icon to remove an image. Drag the handle to reorder pages before download.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                <FiUpload size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2">Drop your images here</h3>
                            <p className="text-slate-400 mb-6">Upload images to arrange them before converting to PDF.</p>

                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                            >
                                <FiUpload size={18} />
                                Choose Images
                            </label>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-slate-300">Processing images...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                {images.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-300 font-medium">Orientation:</span>
                            <select
                                value={orientation}
                                onChange={(e) => setOrientation(e.target.value as any)}
                                className="
                  px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors duration-200
                "
                            >
                                <option value="p">📄 Portrait</option>
                                <option value="l">📊 Landscape</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-slate-400 text-sm">
                                {images.length} image{images.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={() => setImages([])}
                                className="
                  px-4 py-2 bg-red-600/20 hover:bg-red-600/30
                  border border-red-500/30 rounded-lg text-red-400
                  hover:text-red-300 transition-colors duration-200
                  flex items-center gap-2
                "
                            >
                                <FiX size={16} />
                                Clear All
                            </button>
                        </div>
                    </div>
                )}

                {/* Download Button */}
                {images.length > 0 && (
                    <div className="text-center">
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className="
                download-btn px-8 py-4 text-lg font-semibold
                bg-gradient-to-r from-green-600 to-emerald-600
                hover:from-green-700 hover:to-emerald-700
                disabled:from-gray-600 disabled:to-gray-600
                rounded-xl shadow-lg hover:shadow-xl
                transition-all duration-200 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center gap-3 mx-auto
              "
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <FiDownload size={20} />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {images.length === 0 && !loading && (
                    <div className="text-center py-2">
                        <div className="w-24 h-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center mx-auto">
                            <FiImage size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No images uploaded yet</h3>
                        <p className="text-slate-500">Upload some images to get started</p>
                    </div>
                )}

                {/* Image Preview Modal */}
                {previewModal.isOpen && images.length > 0 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                        <div className="relative max-w-4xl max-h-screen p-4">
                            {/* Close button */}
                            <button
                                onClick={closePreview}
                                className="absolute -top-12 right-0 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                                aria-label="Close preview"
                            >
                                <FiX size={20} />
                            </button>

                            {/* Navigation buttons */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                                        aria-label="Previous image"
                                    >
                                        <FiChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                                        aria-label="Next image"
                                    >
                                        <FiChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Image */}
                            <div className="relative">
                                <img
                                    src={images[previewModal.currentIndex]}
                                    alt={`Preview ${previewModal.currentIndex + 1}`}
                                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                />

                                {/* Image counter */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                    {previewModal.currentIndex + 1} / {images.length}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}