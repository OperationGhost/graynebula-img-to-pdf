"use client";

import { useState, useEffect } from "react";
import { compressImage, generatePDF, rotateImage } from "@/components/ImgToPdf/ImgToPdf";
import {
    FiUpload,
    FiDownload,
    FiX,
    FiImage,
    FiGrid,
    FiList,
    FiChevronLeft,
    FiChevronRight,
    FiRotateCw,
} from "react-icons/fi";
import {
    MdOutlineCropLandscape,
    MdOutlineCropPortrait,
} from "react-icons/md";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import HomeNavbar from "@/components/HomeNavbar/HomeNavbar";

type UploadedImage = {
    id: string;
    src: string;
};

type SortableItemProps = {
    id: string;
    src: string;
    index: number;
    onRemove: () => void;
    onRotate: () => Promise<void>;
    onPreview: (index: number) => void;
};

function SortableItem({ id, src, onRemove, onRotate, index, onPreview }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });
    const [isRotating, setIsRotating] = useState(false);
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        height: "fit-content",
        zIndex: isDragging ? 1 : undefined,
    };

    const handleRotate = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (isRotating) return;

        setIsRotating(true);
        try {
            await onRotate();
        } finally {
            setIsRotating(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        relative cursor-grab active:cursor-grabbing
        bg-gradient-to-br from-neutral-900/90 to-black
        backdrop-blur-sm border border-white/10
        rounded-xl overflow-hidden shadow-lg hover:shadow-xl
        ${isDragging ? 'opacity-70 shadow-2xl' : ''}
      `}
        >
            <div className="flex items-center justify-between gap-2 p-3 bg-black/80 border-b border-white/10">
                <button
                    type="button"
                    className="
            w-7 h-7
            bg-white/10 hover:bg-white/20
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
                    onClick={handleRotate}
                    onPointerDown={(event) => event.stopPropagation()}
                    disabled={isRotating}
                    className="
            w-7 h-7
            bg-white/10 hover:bg-white/20 disabled:opacity-60
            rounded-full flex items-center justify-center
            text-white shadow-lg hover:shadow-xl
            transition-all duration-200 hover:scale-110
          "
                    aria-label="Rotate image 90 degrees clockwise"
                    title="Rotate 90° clockwise"
                >
                    <FiRotateCw size={15} className={isRotating ? "animate-spin" : ""} />
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
            bg-white/10 hover:bg-white/20
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
                className="relative overflow-hidden rounded-b-xl bg-neutral-900/50 h-48 w-full group cursor-grab active:cursor-grabbing"
                onClick={() => onPreview(index)}
            >
                <img
                    src={src}
                    alt={`Image ${index + 1}`}
                    draggable={false}
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
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [orientation, setOrientation] = useState<"p" | "l">("p");
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, currentIndex: 0 });
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        // Clear the input value to allow re-uploading the same files
        e.target.value = '';

        setLoading(true);
        try {
            // Process files in batches to avoid overwhelming the browser
            const batchSize = 10;
            const compressed: UploadedImage[] = [];

            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                const batchCompressed = (await Promise.all(
                    batch.map((file) => compressImage(file, 0.7))
                )).map((src) => ({
                    id: crypto.randomUUID(),
                    src,
                }));
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

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        setImages((currentImages) => {
            const oldIndex = currentImages.findIndex((image) => image.id === active.id);
            const newIndex = currentImages.findIndex((image) => image.id === over.id);

            if (oldIndex < 0 || newIndex < 0) return currentImages;

            return arrayMove(currentImages, oldIndex, newIndex);
        });
    };

    const handleDownload = async () => {
        if (images.length === 0) return;

        setLoading(true);
        try {
            await generatePDF(images.map((image) => image.src), orientation);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRotate = async (id: string) => {
        const image = images.find((item) => item.id === id);
        if (!image) return;

        try {
            const src = await rotateImage(image.src);
            setImages((current) =>
                current.map((item) => item.id === id ? { ...item, src } : item)
            );
        } catch (error) {
            console.error("Error rotating image:", error);
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
                files.map((file) => compressImage(file, 0.7))
            );
            setImages((prev) => [
                ...prev,
                ...compressed.map((src) => ({ id: crypto.randomUUID(), src })),
            ]);
        } catch (error) {
            console.error("Error compressing images:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <HomeNavbar />
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_50%)]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 mb-6">
                        <FiImage className="text-white" size={24} />
                        <span className="text-neutral-300 font-medium">Image to PDF Converter</span>
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-4">
                        Transform Images into PDFs
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Upload your images, arrange them in any order, and generate a professional PDF document in seconds.
                    </p>
                </div>

                {/* Upload Area */}
                <div
                    className={`
            relative mb-8 border-2 rounded-2xl transition-all duration-300
            ${dragOver
                            ? 'border-white bg-white/5 scale-105'
                            : 'border-neutral-700 hover:border-neutral-500 hover:bg-white/[0.03]'
                        }
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {images.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-[1.8fr_0.95fr] p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={images.map((image) => image.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        {images.map((image, index) => (
                                            <SortableItem
                                                key={image.id}
                                                id={image.id}
                                                src={image.src}
                                                index={index}
                                                onRemove={() => setImages((current) => current.filter((item) => item.id !== image.id))}
                                                onRotate={() => handleRotate(image.id)}
                                                onPreview={openPreview}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-black/85 p-6 flex flex-col justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm text-neutral-100 mb-5">
                                        <FiUpload size={18} />
                                        <span className="font-medium">Add more images</span>
                                    </div>
                                    <p className="text-neutral-400 mb-6">
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
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:scale-[1.02] hover:bg-neutral-200 cursor-pointer"
                                    >
                                        <FiUpload size={18} />
                                        Add more images
                                    </label>
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-4 text-neutral-300">
                                    <p className="text-sm font-semibold text-white mb-2">Tip</p>
                                    <p className="text-sm leading-6">
                                        Use the remove and rotate icons to edit images, and drag to reorder pages before download.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-black">
                                <FiUpload size={28} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2">Drop your images here</h3>
                            <p className="text-neutral-400 mb-6">Upload images to arrange them before converting to PDF.</p>

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
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:scale-[1.02] hover:bg-neutral-200 cursor-pointer"
                            >
                                <FiUpload size={18} />
                                Choose Images
                            </label>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-neutral-300">Processing images...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                {images.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-neutral-900/70 backdrop-blur-sm border border-white/10 rounded-xl">
                        <div className="flex items-center gap-4">
                            <span className="text-neutral-300 font-medium">Orientation:</span>
                            <div className="flex items-center gap-2" role="group" aria-label="Page orientation">
                                <button
                                    type="button"
                                    onClick={() => setOrientation("p")}
                                    aria-pressed={orientation === "p"}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors duration-200 ${
                                        orientation === "p"
                                        ? "border-white bg-white text-black"
                                        : "border-white/20 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                                    }`}
                                >
                                    <MdOutlineCropPortrait aria-hidden="true" size={20} />
                                    Portrait
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOrientation("l")}
                                    aria-pressed={orientation === "l"}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors duration-200 ${
                                        orientation === "l"
                                        ? "border-white bg-white text-black"
                                        : "border-white/20 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                                    }`}
                                >
                                    <MdOutlineCropLandscape aria-hidden="true" size={20} />
                                    Landscape
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-neutral-400 text-sm">
                                {images.length} image{images.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={() => setImages([])}
                                className="
                  px-4 py-2 bg-white/5 hover:bg-white/10
                  border border-white/15 rounded-lg text-neutral-200
                  hover:text-white transition-colors duration-200
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
                bg-white text-black hover:bg-neutral-200
                disabled:bg-neutral-600 disabled:text-neutral-300
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
                        <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto">
                            <FiImage size={32} className="text-neutral-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-300 mb-2">No images uploaded yet</h3>
                        <p className="text-neutral-400">Upload some images to get started</p>
                    </div>
                )}

                {/* Image Preview Modal */}
                {previewModal.isOpen && images.length > 0 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                        <div className="relative max-w-4xl max-h-screen p-4">
                            {/* Close button */}
                            <button
                                onClick={closePreview}
                                className="absolute -top-12 right-0 w-10 h-10 bg-neutral-900/80 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                                aria-label="Close preview"
                            >
                                <FiX size={20} />
                            </button>

                            {/* Navigation buttons */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-900/80 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                                        aria-label="Previous image"
                                    >
                                        <FiChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-900/80 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                                        aria-label="Next image"
                                    >
                                        <FiChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Image */}
                            <div className="relative">
                                <img
                                    src={images[previewModal.currentIndex].src}
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